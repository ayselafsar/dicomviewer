import $ from 'jquery';
import _ from 'underscore';
import { cornerstone, cornerstoneTools } from '../../cornerstonejs';
import { DCMViewer } from '../index';
import { Viewerbase } from '../../viewerbase';
import { DCMViewerError } from '../../DCMViewerError';
import { DCMViewerLog } from '../../DCMViewerLog';
import ImageControls from '../../../components/templates/ImageControls.html';
import ViewportOverlay from '../../../components/templates/ViewportOverlay.html';
import ViewportOrientationMarkers from '../../../components/templates/ViewportOrientationMarkers.html';

// Get compression information of image
function getCompression() {
    const { element } = DCMViewer.instance.viewportData;
    const viewportIndex = DCMViewer.ui.$imageViewerViewport.index(element);
    const viewportData = DCMViewer.layoutManager.viewportData[viewportIndex];

    if (!viewportData.imageId) {
        return false;
    }

    const instance = cornerstone.metaData.get('instance', viewportData.imageId);
    if (!instance) {
        return '';
    }

    if (instance.lossyImageCompression === '01' &&
        instance.lossyImageCompressionRatio !== '') {
        const compressionMethod = instance.lossyImageCompressionMethod || t('dicomviewer', 'Lossy: ');
        const compressionRatio = parseFloat(instance.lossyImageCompressionRatio).toFixed(2);
        return `${compressionMethod}${compressionRatio} : 1`;
    }

    return t('dicomviewer', 'Lossless/Uncompressed');
}

// Update overlay information which shows study and series information briefly on viewport
function updateOverlay() {
    const { element } = DCMViewer.instance.viewportData;
    const viewportIndex = DCMViewer.ui.$imageViewerViewport.index(element);
    const { viewportOverlayUtils } = DCMViewer.viewerbase;
    const viewportData = DCMViewer.layoutManager.viewportData[viewportIndex];
    const image = viewportOverlayUtils.getImage(viewportData.viewportIndex);
    const dimensions = image ? `${image.width} x ${image.height}` : '';
    const stack = DCMViewer.viewerbase.getStackDataIfNotEmpty(viewportIndex);
    const numImages = stack && stack.imageIds ? stack.imageIds.length : '';

    const $slider = $('.imageSlider');
    $slider.val(stack.currentImageIdIndex + 1);

    // Remove viewport overlay if exists
    $('.imageViewerViewportOverlay').remove();

    // Update overlay data
    const viewportOverlayContent = ViewportOverlay({
        patientName: viewportOverlayUtils.getPatient.call(viewportData, 'name'),
        patientId: viewportOverlayUtils.getPatient.call(viewportData, 'id'),
        studyDescription: viewportOverlayUtils.getStudy.call(viewportData, 'studyDescription'),
        studyDate: viewportOverlayUtils.getStudy.call(viewportData, 'studyDate'),
        studyTime: viewportOverlayUtils.getStudy.call(viewportData, 'studyTime'),
        seriesNumber: viewportOverlayUtils.getSeries.call(viewportData, 'seriesNumber'),
        instanceNumber: viewportOverlayUtils.getInstance.call(image, 'instanceNumber'),
        imageIndex: stack.currentImageIdIndex + 1,
        numImages,
        seriesDescription: viewportOverlayUtils.getSeries.call(viewportData, 'seriesDescription'),
        dimensions,
        compression: getCompression(),
    });

    $('.removable').append(viewportOverlayContent);
}

function loadDisplaySetIntoViewport() {
    DCMViewerLog.info('imageViewerViewport loadDisplaySetIntoViewport');

    const data = DCMViewer.instance.viewportData;

    // Make sure we have all the data required to render the series
    if (!data.study || !data.displaySet || !data.element) {
        DCMViewerLog.warn('loadDisplaySetIntoViewport: No Study, Display Set, or Element provided');
        return;
    }

    // Get the current element and it's index in the list of all viewports
    // The viewport index is often used to store information about a viewport element
    const { element } = data;
    const viewportIndex = DCMViewer.ui.$imageViewerViewport.index(element);

    const { layoutManager } = DCMViewer;
    layoutManager.viewportData = layoutManager.viewportData || {};
    layoutManager.viewportData[viewportIndex] = layoutManager.viewportData[viewportIndex] || {};
    layoutManager.viewportData[viewportIndex].viewportIndex = viewportIndex;

    // Create shortcut to displaySet
    const { displaySet } = data;

    // Get stack from Stack Manager
    let stack = Viewerbase.StackManager.findOrCreateStack(data.study, displaySet);

    // Shortcut for array with image IDs
    const { imageIds } = stack;
    const imageIdIndex = data.currentImageIdIndex;

    // Define the current image stack using the newly created image IDs
    stack = {
        currentImageIdIndex: imageIdIndex > 0 && imageIdIndex < imageIds.length ? imageIdIndex : 0,
        imageIds,
        displaySetInstanceUid: data.displaySetInstanceUid
    };

    // Get the current image ID for the stack that will be rendered
    const imageId = imageIds[stack.currentImageIdIndex];

    cornerstone.enable(data.element);

    // Get the handler functions that will run when loading has finished or thrown
    // an error. These are used to show/hide loading / error text boxes on each viewport.
    const errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

    // Get the current viewport settings
    const viewport = cornerstone.getViewport(element);

    const {
        studyInstanceUid, seriesInstanceUid, displaySetInstanceUid, currentImageIdIndex
    } = data;

    // Store the current series data inside the Layout Manager
    layoutManager.viewportData[viewportIndex] = {
        imageId,
        studyInstanceUid,
        seriesInstanceUid,
        displaySetInstanceUid,
        currentImageIdIndex,
        viewport: viewport || data.viewport,
        viewportIndex
    };

    // TODO
    // Update layoutManager of viewer
    // DCMViewer.instance.layoutManager = layoutManager;

    let imagePromise;
    try {
        imagePromise = cornerstone.loadAndCacheImage(imageId);
    } catch (error) {
        DCMViewerLog.info(error);
        if (!imagePromise) {
            errorLoadingHandler(element, imageId, error);
            return;
        }
    }

    // Start loading the image.
    imagePromise.then((image) => {
        let enabledElement;
        try {
            enabledElement = cornerstone.getEnabledElement(element);
        } catch (error) {
            DCMViewerLog.warn('Viewport destroyed before loaded image could be displayed');
            return;
        }

        // Update metadata from image dataset
        DCMViewer.viewer.metadataProvider.updateMetadata(image);

        // Enable mouse interactions
        cornerstoneTools.mouseInput.enable(element);
        cornerstoneTools.touchInput.enable(element);
        cornerstoneTools.mouseWheelInput.enable(element);
        cornerstoneTools.keyboardInput.enable(element);

        // Update the enabled element with the image and viewport data
        // This is not usually necessary, but we need them stored in case
        // a sopClassUid-specific viewport setting is present.
        enabledElement.image = image;
        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);

        // Display image on viewport
        cornerstone.displayImage(element, image, enabledElement.viewport);

        // Display orientation markers
        DCMViewer.viewerbase.updateOrientationMarkers(element, enabledElement.viewport);

        // Resize the canvas to fit the current viewport element size. Fit the displayed
        // image to the canvas dimensions.
        cornerstone.resize(element, true);

        // Use the tool manager to enable the currently active tool for this
        // newly rendered element
        const activeTool = DCMViewer.tools.toolManager.getActiveTool();
        DCMViewer.tools.toolManager.setActiveTool(activeTool, [element]);

        // Set the stack as tool state
        cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
        cornerstoneTools.addToolState(element, 'stack', stack);

        // Enable all tools we want to use with this element
        cornerstoneTools.stackScrollWheel.activate(element);

        // Update overlay information
        updateOverlay();

        // Handle changes if a new image is displayed
        element.addEventListener('cornerstonenewimage', (event) => {
            const eventData = event.detail;
            const currentImage = eventData.enabledElement.image;

            // Update metadata from image dataset
            DCMViewer.viewer.metadataProvider.updateMetadata(currentImage);

            layoutManager.viewportData[viewportIndex].imageId = currentImage.imageId;

            // Get the element and stack data
            const targetElement = event.target;
            const toolData = cornerstoneTools.getToolState(targetElement, 'stack');
            if (!toolData || !toolData.data || !toolData.data.length) {
                return;
            }

            // Update overlay information
            updateOverlay();

            // Display orientation markers
            DCMViewer.viewerbase.updateOrientationMarkers(targetElement);

            // If this viewport is displaying a stack of images, save the current image
            // index in the stack to the global DCMViewer.viewer.data object.
            const stackState = cornerstoneTools.getToolState(targetElement, 'stack');
            if (stackState && stackState.data.length && stackState.data[0].imageIds.length > 1) {
                layoutManager.viewportData[viewportIndex].currentImageIdIndex = stackState.data[0].imageIds.indexOf(currentImage.imageId);
            }
        });

        // Handle changes on each image rendering
        element.addEventListener('cornerstoneimagerendered', (e) => {
            // Update overlay information
            updateOverlay();

            const viewportVal = cornerstone.getViewport(e.target);
            const $zoomLevel = $('#zoomLevel');
            const $windowLevel = $('#windowLevel');

            $zoomLevel.text(`${t('dicomviewer', 'Zoom')}: ${viewportVal.scale.toFixed(2)}`);
            $windowLevel.text(`${t('dicomviewer', 'WW/WC')}: ${Math.round(viewportVal.voi.windowWidth)} / ${Math.round(viewportVal.voi.windowCenter)}`);
        });
    });
}

function setImageControlButton($element) {
    $element.on('touchstart', function () {
        if ($(this).hasClass('imageControlButtonActive')) {
            return;
        }

        $(this).addClass('imageControlButtonActive');
    });

    $element.on('touchend', function () {
        if (!$(this).hasClass('imageControlButtonActive')) {
            return;
        }

        $(this).removeClass('imageControlButtonActive');
    });

    $element.on('mouseenter', function () {
        if ($(this).hasClass('imageControlButtonActive')) {
            return;
        }

        $(this).addClass('imageControlButtonActive');
    });

    $element.on('mouseleave', function () {
        if (!$(this).hasClass('imageControlButtonActive')) {
            return;
        }

        $(this).removeClass('imageControlButtonActive');
    });
}

function renderImageControls() {
    const data = DCMViewer.instance.viewportData;
    const numImages = data.displaySet.images.length;
    const imageIndex = 1;

    const imageControlsContent = ImageControls({ imageIndex, numImages });
    $('#imageControls').html(imageControlsContent);

    // Set size of scrollbar
    setTimeout(() => {
        const $slider = $('.imageSlider');
        const $imageControlUp = $('.imageControlUp');
        const $imageControlDown = $('.imageControlDown');
        const $element = DCMViewer.ui.$imageViewerViewport;
        const element = $element.get(0);

        // Change the instance when scrollbar is changed
        $slider.on('input change', () => {
            const newImageIdIndex = parseInt($slider.val(), 10) - 1;
            cornerstoneTools.scrollToIndex(element, newImageIdIndex);
        });

        // Change image slider's value with image control buttons
        $imageControlUp.on('click', (e) => {
            e.stopImmediatePropagation();

            let currentSliderVal = parseInt($slider.val(), 10);
            if (currentSliderVal === 0) {
                return;
            }

            currentSliderVal -= 1;

            $slider.val(currentSliderVal);
            $slider.trigger('change');
        });

        // Change image slider's value with image control buttons
        $imageControlDown.on('click', (e) => {
            e.stopImmediatePropagation();

            let currentSliderVal = parseInt($slider.val(), 10);
            let maxValue = $slider.attr('max');
            maxValue = parseInt(maxValue, 10);
            if (currentSliderVal === maxValue) {
                return;
            }

            currentSliderVal += 1;

            $slider.val(currentSliderVal);
            $slider.trigger('change');
        });

        setImageControlButton($imageControlUp);
        setImageControlButton($imageControlDown);

        const handleResize = _.throttle(() => {
            const viewportHeight = $element.height();
            $slider.width(viewportHeight - 120);
        }, 150);

        handleResize();

        $(window).on('resize', handleResize);
    }, 300);
}

/**
 * Render layout
 * @param viewportData
 */
const renderLayout = (viewportData) => {
    const { studies } = DCMViewer.viewerbase.data;
    const study = studies.find(entry => entry.studyInstanceUid === viewportData.studyInstanceUid);

    if (!study) {
        DCMViewerError('Study does not exist');
    }

    viewportData.study = study;

    if (!study.displaySets) {
        DCMViewerError('Study has no display sets');
    }

    study.displaySets.every((displaySet) => {
        if (displaySet.displaySetInstanceUid === viewportData.displaySetInstanceUid) {
            viewportData.displaySet = displaySet;
            return false;
        }

        return true;
    });

    const $imageViewerViewport = $('.imageViewerViewport');
    viewportData.element = $imageViewerViewport.get(0);
    DCMViewer.ui.$imageViewerViewport = $imageViewerViewport;
    DCMViewer.instance.viewportData = viewportData;

    // Update dicom image container attributes to disallow manipulating viewer
    $imageViewerViewport.on('contextmenu', () => false);
    $imageViewerViewport.on('mousedown', () => false);
    $imageViewerViewport.on('selectstart', () => false);

    // Render orientation markers template before displaying image
    $('#viewportOrientationMarkers').html(ViewportOrientationMarkers);

    // Load and display image
    loadDisplaySetIntoViewport();

    // Render image controls
    renderImageControls();
};

function jumpToImage(viewportIndex, studyInstanceUid, seriesInstanceUid, sopInstanceUid) {
    const study = DCMViewer.viewer.Studies.find(s => s.studyInstanceUid === studyInstanceUid);

    // Find the proper stack to display
    const stacksFromSeries = study.displaySets.filter(stack => stack.seriesInstanceUid === seriesInstanceUid);
    const stack = stacksFromSeries.find((s) => {
        const imageIndex = s.images.findIndex(image => image.getSOPInstanceUID() === sopInstanceUid);
        return imageIndex > -1;
    });

    // TODO: make this work for multi-frame instances
    const specificImageIndex = stack.images.findIndex(image => image.getSOPInstanceUID() === sopInstanceUid);

    const viewportData = {
        studyInstanceUid,
        seriesInstanceUid,
        displaySetInstanceUid: stack.displaySetInstanceUid,
        displaySet: stack,
        currentImageIdIndex: specificImageIndex
    };

    DCMViewer.layoutManager.rerenderViewportWithNewDisplaySet(viewportIndex, viewportData);
}

/**
 * Render viewport
 */
export default function renderViewport() {
    if (!DCMViewer.instance) {
        DCMViewer.instance = {};
    }

    const { studies, imageToJump } = DCMViewer.viewerbase.data;
    DCMViewer.instance.parentElement = $('#layoutManagerTarget');

    const studyPrefetcher = DCMViewer.viewerbase.StudyPrefetcher.getInstance();
    DCMViewer.instance.studyPrefetcher = studyPrefetcher;

    DCMViewer.instance.studyLoadingListener = DCMViewer.viewerbase.StudyLoadingListener.getInstance();
    DCMViewer.instance.studyLoadingListener.clear();
    DCMViewer.instance.studyLoadingListener.addStudies(studies);

    DCMViewer.layoutManager = new DCMViewer.viewerbase.LayoutManager(DCMViewer.instance.parentElement, studies, renderLayout);
    DCMViewer.layoutManager.updateViewports();

    if (imageToJump) {
        const { studyInstanceUid, seriesInstanceUid, sopInstanceUid } = imageToJump;
        jumpToImage(0, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
    }

    studyPrefetcher.setStudies(studies);
}
