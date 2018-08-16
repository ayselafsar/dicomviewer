import $ from 'jquery';
import { cornerstone } from '../../../../lib/cornerstonejs';
import { viewportUtils } from './viewportUtils';

const DEFAULT_FILENAME = 'image';

const getFormData = () => ({
    $imageViewerViewport: $('.viewport-element-hidden'),
    fileName: $('#viewport-preview-name').val() || DEFAULT_FILENAME,
    imageType: $('#viewport-image-type').val(),
    width: $('#viewport-preview-width').val(),
    height: $('#viewport-preview-height').val(),
    showAnnotations: $('#showAnnotations').prop('checked'),
    quality: $('#viewport-preview-quality').val(),
    keepAspectRatio: $('#keepAspectRatio').data('keep-ratio').toString() === 'true'
});

const setElementSize = (element, canvas, size, value) => {
    $(element)[size](value);
    canvas[size] = value;
    canvas.style[size] = `${value}px`;
};

const updateViewportPreview = ($imageViewerViewport, imageType = 'png') => {
    if (!$imageViewerViewport) {
        return;
    }

    $imageViewerViewport.one('cornerstoneimagerendered', (event) => {
        const $viewportPreview = $('.viewport-preview');
        const downloadCanvas = $('.viewport-element-hidden').find('canvas')[0];

        const type = `image/${imageType}`;
        const src = downloadCanvas.toDataURL(type, 1.0);

        const $element = $(event.currentTarget);
        const maxSize = 512;
        let width = $element.width();
        let height = $element.height();
        if (width > maxSize || height > maxSize) {
            const multiplier = maxSize / Math.max(width, height);
            height *= multiplier;
            width *= multiplier;
        }

        $viewportPreview.attr('src', src);

        $viewportPreview.width(width);
        $viewportPreview.height(height);
    });
};

const updateViewportElement = (viewportWidth, viewportHeight, annotations = true) => {
    const activeViewport = viewportUtils.getActiveViewportElement();
    const enabledElement = cornerstone.getEnabledElement(activeViewport);
    const $viewportElement = $('.viewport-element-hidden');
    const viewportElement = $viewportElement[0];

    const downloadCanvas = $viewportElement.find('canvas')[0];
    cornerstone.loadImage(enabledElement.image.imageId).then((image) => {
        cornerstone.displayImage(viewportElement, image);
        cornerstone.setViewport(viewportElement, enabledElement.viewport);
        cornerstone.resize(viewportElement, true);

        viewportUtils.toggleAnnotations(viewportElement, annotations);

        const maxSize = 16384;
        const width = Math.min(viewportWidth || image.width, maxSize);
        const height = Math.min(viewportHeight || image.height, maxSize);
        setElementSize(viewportElement, downloadCanvas, 'width', width);
        setElementSize(viewportElement, downloadCanvas, 'height', height);

        cornerstone.fitToWindow(viewportElement);

        updateViewportPreview($viewportElement, 'png');
    });
};

const registerImageType = () => {
    $('#viewport-image-type').change(() => {
        const formData = getFormData();

        updateViewportPreview(formData.$imageViewerViewport, formData.imageType);
    });
};

const registerShowAnnotations = () => {
    $('#showAnnotations').change(() => {
        const formData = getFormData();
        const { $imageViewerViewport } = formData;
        const imageViewerViewport = $imageViewerViewport[0];

        viewportUtils.toggleAnnotations(imageViewerViewport, formData.showAnnotations);
        updateViewportPreview($imageViewerViewport, formData.imageType);
    });
};

const registerKeepAspectRatio = () => {
    $('#keepAspectRatio').click((e) => {
        const $this = $(e.currentTarget);
        const keepRatio = $this.data('keep-ratio').toString() === 'true';

        if (keepRatio) {
            $this.data('keep-ratio', 'false');
            $this.find('i').removeClass('fa-link').addClass('fa-unlink');
        } else {
            $this.data('keep-ratio', 'true');
            $this.find('i').removeClass('fa-unlink').addClass('fa-link');
        }

        $('#viewport-preview-width').trigger('change');
    });
};

const registerSize = () => {
    $('.js-preview-size').change((e) => {
        const $this = $(e.currentTarget);
        const formData = getFormData();
        const size = $this.data('size');
        const value = size === 'width' ? formData.width : formData.height;
        const maxValue = $this.attr('max');

        if (parseInt(value, 10) > parseInt(maxValue, 10)) {
            $this.val(maxValue);
            formData[size] = maxValue;
        }

        const viewportElement = formData.$imageViewerViewport[0];
        const downloadCanvas = formData.$imageViewerViewport.find('canvas')[0];
        const enabledElement = cornerstone.getEnabledElement(viewportElement);

        if (formData.keepAspectRatio) {
            const { image } = enabledElement;

            if (size === 'width') {
                const multiplier = formData.width / enabledElement.image.width;
                formData.height = Math.round(image.height * multiplier);
                setElementSize(viewportElement, downloadCanvas, 'height', formData.height);

                $('#viewport-preview-height').val(formData.height);
            } else {
                const multiplier = formData.height / enabledElement.image.height;
                formData.width = Math.round(image.width * multiplier);
                setElementSize(viewportElement, downloadCanvas, 'width', formData.width);

                $('#viewport-preview-width').val(formData.width);
            }
        } else {
            setElementSize(viewportElement, downloadCanvas, size, value);
        }

        updateViewportElement(formData.width, formData.height, formData.showAnnotations);
    });
};

const registerDownloadImage = () => {
    $('#downloadImage').click(() => {
        const formData = getFormData();
        const downloadCanvas = formData.$imageViewerViewport.find('canvas')[0];
        const fullFileName = `${formData.fileName}.${formData.imageType}`;
        const quality = formData.imageType === 'png' ? 1 : formData.quality / 100;
        const href = downloadCanvas.toDataURL(`image/${formData.imageType}`, quality);
        const $downloadImage = $(document).find('a.downloadImage');

        if ($downloadImage.length) {
            $downloadImage.attr('download', fullFileName);
            $downloadImage.attr('href', href);
            $($downloadImage)[0].click();

            return;
        }

        // Create a new hyperlink element
        const link = document.createElement('a');
        link.classList.add('downloadImage');
        link.download = fullFileName;
        link.href = href;
        document.body.appendChild(link);
        $(link)[0].click();
    });
};

// Register Preview Dialog Events
const registerPreviewDialogEvents = () => {
    registerImageType();
    registerShowAnnotations();
    registerKeepAspectRatio();
    registerSize();
    registerDownloadImage();
};

const initializeViewport = () => {
    const activeViewport = viewportUtils.getActiveViewportElement();
    const enabledElement = cornerstone.getEnabledElement(activeViewport);

    const viewport = Object.assign({}, enabledElement.viewport);
    delete viewport.scale;
    viewport.translation = {
        x: 0,
        y: 0
    };

    const $viewportElement = $('.viewport-element-hidden');
    const viewportElement = $viewportElement[0];

    cornerstone.enable(viewportElement);
};

const show = () => {
    const $viewerMain = $('#viewerMain');

    if ($viewerMain.find('.modal').length) {
        // Clear previous modal
        $viewerMain.find('.modal').remove();
    }

    // Get modal dialog content
    $.ajax({
        url: OC.generateUrl('/apps/dicomviewer/captureImage'),
        type: 'GET',
        contentType: 'text/html',
    }).done((response) => {
        $viewerMain.append(response);

        registerPreviewDialogEvents();
        initializeViewport();

        // Set initial image size
        const activeViewport = viewportUtils.getActiveViewportElement();
        const enabledElement = cornerstone.getEnabledElement(activeViewport);

        updateViewportElement(enabledElement.image.width, enabledElement.image.height);

        $('#viewport-preview-width').val(enabledElement.image.width);
        $('#viewport-preview-height').val(enabledElement.image.height);

        // Open dialog
        $('.captureImageDialog').modal();
    }).fail((response, code) => {
        console.error(response, code);
    });
};

const captureImageDialog = {
    show,
};

export { captureImageDialog };
