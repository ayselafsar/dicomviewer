import $ from 'jquery';
import { cornerstone, cornerstoneTools } from '../../../../lib/cornerstonejs';
import { Viewerbase } from '../../viewerbase';
import { captureImageDialog } from './captureImageDialog';

// TODO: Check if there is any way to import this
const { updateOrientationMarkers } = Viewerbase;

const getEnabledElement = (element) => {
    let enabledElement;

    try {
        enabledElement = cornerstone.getEnabledElement(element);
    } catch (error) {
        console.warn(error);
    }

    return enabledElement;
};

const getActiveViewportElement = () => $('.imageViewerViewport').get(0);

const getAnnotationTools = () => ['length', 'probe', 'simpleAngle', 'arrowAnnotate', 'ellipticalRoi', 'rectangleRoi'];

const toggleAnnotations = (viewportElement, toggle) => {
    const action = toggle ? 'enable' : 'disable';
    const annotationTools = getAnnotationTools();
    annotationTools.forEach(tool => cornerstoneTools[tool][action](viewportElement));
};

const rotateL = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return;
    }

    viewport.rotation -= 90;
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const rotateR = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return;
    }

    viewport.rotation += 90;
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const invert = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return;
    }

    viewport.invert = (viewport.invert === false);
    cornerstone.setViewport(element, viewport);
};

const flipV = () => {
    const element = getActiveViewportElement();

    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return;
    }

    viewport.vflip = (viewport.vflip === false);
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const flipH = () => {
    const element = getActiveViewportElement();

    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return;
    }

    viewport.hflip = (viewport.hflip === false);
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const resetViewport = (viewportIndex = null) => {
    if (viewportIndex === null) {
        cornerstone.reset(getActiveViewportElement());
    } else if (viewportIndex === 'all') {
        $('.imageViewerViewport').each((index, element) => {
            cornerstone.reset(element);
        });
    } else {
        cornerstone.reset($('.imageViewerViewport').get(viewportIndex));
    }
};

const clearTools = () => {
    const element = getActiveViewportElement();

    if (!element) {
        return;
    }

    const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
    toolStateManager.clear(element);
    cornerstone.updateImage(element);
};

const toggleCaptureImageDialog = () => {
    captureImageDialog.show();
};

/**
 * Export functions inside viewportUtils namespace.
 */

const viewportUtils = {
    getEnabledElement,
    getActiveViewportElement,
    rotateL,
    rotateR,
    invert,
    flipV,
    flipH,
    resetViewport,
    clearTools,
    toggleAnnotations,
    toggleCaptureImageDialog,
};

export { viewportUtils };
