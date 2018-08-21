import Handlebars from "handlebars";
import {DCMViewer} from "../index";
import { Viewerbase } from "../../viewerbase";
import {DCMViewerError} from "../../DCMViewerError";
import {cornerstone, cornerstoneTools} from "../../../cornerstonejs";
import {DCMViewerLog} from "../../DCMViewerLog";

function loadDisplaySetIntoViewport(data) {
    DCMViewerLog.info('imageViewerViewport loadDisplaySetIntoViewport');

    // Make sure we have all the data required to render the series
    if (!data.study || !data.displaySet || !data.element) {
        DCMViewerLog.warn('loadDisplaySetIntoViewport: No Study, Display Set, or Element provided');
        return;
    }

    // Get the current element and it's index in the list of all viewports
    // The viewport index is often used to store information about a viewport element
    const element = data.element;
    const viewportIndex = $('.imageViewerViewport').index(element);

    const layoutManager =  DCMViewer.layoutManager;
    layoutManager.viewportData = layoutManager.viewportData || {};
    layoutManager.viewportData[viewportIndex] = layoutManager.viewportData[viewportIndex] || {};
    layoutManager.viewportData[viewportIndex].viewportIndex = viewportIndex;

    // Create shortcut to displaySet
    const displaySet = data.displaySet;

    // Get stack from Stack Manager
    let stack = Viewerbase.StackManager.findOrCreateStack(data.study, displaySet);

    // Shortcut for array with image IDs
    const imageIds = stack.imageIds;

    // Define the current image stack using the newly created image IDs
    stack = {
        currentImageIdIndex: data.currentImageIdIndex > 0 && data.currentImageIdIndex < imageIds.length ? data.currentImageIdIndex : 0,
        imageIds: imageIds,
        displaySetInstanceUid: data.displaySetInstanceUid
    };

    // Get the current image ID for the stack that will be rendered
    const imageId = imageIds[stack.currentImageIdIndex];

    cornerstone.enable(data.element);
    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.touchInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);
    cornerstoneTools.keyboardInput.enable(element);

    // Get the handler functions that will run when loading has finished or thrown
    // an error. These are used to show/hide loading / error text boxes on each viewport.
    const endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
    const errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

    // Get the current viewport settings
    const viewport = cornerstone.getViewport(element);

    const { studyInstanceUid, seriesInstanceUid, displaySetInstanceUid, currentImageIdIndex } = data;

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
    imagePromise.then(image => {
        let enabledElement;
        try {
            enabledElement = cornerstone.getEnabledElement(element);
        }
        catch (error) {
            DCMViewerLog.warn('Viewport destroyed before loaded image could be displayed');
            return;
        }

        // Update metadata from image dataset
        DCMViewer.viewer.metadataProvider.updateMetadata(image);

        // Update the enabled element with the image and viewport data
        // This is not usually necessary, but we need them stored in case
        // a sopClassUid-specific viewport setting is present.
        enabledElement.image = image;
        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);

        cornerstone.displayImage(element, image, enabledElement.viewport);

        // Display orientation markers
        DCMViewer.viewerbase.updateOrientationMarkers(element, viewport);

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
        //cornerstoneTools.stackScroll.activate(element, 1);
        cornerstoneTools.stackScrollWheel.activate(element);

        updateOverlay();

        function getCompression() {
            const viewportData = layoutManager.viewportData[viewportIndex];

            if (!viewportData.imageId) {
                return false;
            }

            const instance = cornerstone.metaData.get('instance', viewportData.imageId);
            if (!instance) {
                return '';
            }

            if (instance.lossyImageCompression === '01' &&
                instance.lossyImageCompressionRatio !== '') {
                const compressionMethod = instance.lossyImageCompressionMethod || 'Lossy: ';
                const compressionRatio = parseFloat(instance.lossyImageCompressionRatio).toFixed(2);
                return compressionMethod + compressionRatio + ' : 1';
            }

            return 'Lossless / Uncompressed';
        }

        function updateOverlay() {
            const viewportOverlayUtils = DCMViewer.viewerbase.viewportOverlayUtils;
            const viewportData = layoutManager.viewportData[viewportIndex];
            const image = viewportOverlayUtils.getImage(viewportData.viewportIndex);
            const dimensions = image ? `${image.width} x ${image.height}` : '';
            const stack = DCMViewer.viewerbase.getStackDataIfNotEmpty(viewportIndex);
            const numImages = stack && stack.imageIds ? stack.imageIds.length : '';

            // TODO: Keep $imageSLider in global object
            const $slider = $('.imageSlider');
            $slider.val(stack.currentImageIdIndex + 1);

            // Update overlay data
            const source = $('#viewportOverlayTemplate').html();
            const template = Handlebars.compile(source);

            const content = template({
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

            $('#viewportOverlay').html(content);
        }

        element.addEventListener('cornerstonenewimage', function () {
            updateOverlay();
        });

        element.addEventListener('cornerstoneimagerendered', (e) => {
            updateOverlay();

            const viewport = cornerstone.getViewport(e.target);

            const $zoomLevel = $('#zoomLevel');
            const $windowLevel = $('#windowLevel');


            $zoomLevel.text(`Zoom: ${viewport.scale.toFixed(2)}`);
            $windowLevel.text(`WW/WC: ${Math.round(viewport.voi.windowWidth)} / ${Math.round(viewport.voi.windowCenter)}`);
        });
    });
}

function renderViewportOverlays(data) {
    const numImages = data.displaySet.images.length;
    const imageIndex = 1;

    const source = $('#imageControlsTemplate').html();
    const template = Handlebars.compile(source);
    $('#imageControls').html(template({ imageIndex, numImages }));

    // Set size of scrollbar
    setTimeout(() => {
        const $slider = $('.imageSlider');
        const $element = $('.imageViewerViewport');
        const element = $element.get(0);

        // Change the instance when scrollbar is changed
        $slider.on('input change', () => {
            const newImageIdIndex = parseInt($slider.val(), 10) - 1;
            cornerstoneTools.scrollToIndex(element, newImageIdIndex);
        });

        const handleResize = _.throttle(() => {
            const viewportHeight = $element.height();
            $slider.width(viewportHeight - 20);
        }, 150);

        handleResize();

        $(window).on('resize', handleResize);
    }, 300);
}

const renderLayout = (viewportData) => {
    const study = DCMViewer.viewerbase.data.studies.find(study => study.studyInstanceUid === viewportData.studyInstanceUid);

    if (!study) {
        DCMViewerError('Study does not exist')
    }

    viewportData.study = study;

    if (!study.displaySets) {
        DCMViewerError('Study has no display sets');
    }

    study.displaySets.every(displaySet => {
        if (displaySet.displaySetInstanceUid === viewportData.displaySetInstanceUid) {
            viewportData.displaySet = displaySet;
            return false;
        }

        return true;
    });

    const $imageViewerViewport = $('.imageViewerViewport');

    viewportData.element = $imageViewerViewport.get(0);

    // Update dicom image container attributes to disallow manipulating viewer
    $imageViewerViewport.on('contextmenu', () => false);
    $imageViewerViewport.on('mousedown', () => false);
    $imageViewerViewport.on('selectstart', () => false);
    $imageViewerViewport.on('contextmenu', () => false);

    const orientationMarkersSource = $('#viewportOrientationMarkersTemplate').html();
    const orientationMarkersTemplate = Handlebars.compile(orientationMarkersSource);
    $('#viewportOrientationMarkers').html(orientationMarkersTemplate());

    loadDisplaySetIntoViewport(viewportData);

    renderViewportOverlays(viewportData);
};

/**
 * Renders viewport
 */
export default function renderViewport() {
    if (!DCMViewer.instance) {
        DCMViewer.instance = {};
    }

    const studies = DCMViewer.viewerbase.data.studies;
    DCMViewer.instance.parentElement = $('#layoutManagerTarget');

    const studyPrefetcher = DCMViewer.viewerbase.StudyPrefetcher.getInstance();
    DCMViewer.instance.studyPrefetcher = studyPrefetcher;

    DCMViewer.instance.studyLoadingListener = DCMViewer.viewerbase.StudyLoadingListener.getInstance();
    DCMViewer.instance.studyLoadingListener.clear();
    DCMViewer.instance.studyLoadingListener.addStudies(studies);

    DCMViewer.layoutManager = new DCMViewer.viewerbase.LayoutManager(DCMViewer.instance.parentElement, studies, renderLayout);
    DCMViewer.layoutManager.updateViewports();

    studyPrefetcher.setStudies(studies);
};