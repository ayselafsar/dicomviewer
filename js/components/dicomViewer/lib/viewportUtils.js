import $ from 'jquery';
import { cornerstone, cornerstoneTools } from '../../../lib/cornerstonejs';
import updateOrientationMarkers from './updateOrientationMarkers';

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

/**
 * Export functions inside viewportUtils namespace.
 */

const viewportUtils = {
    getEnabledElement,
    rotateL,
    rotateR,
    invert,
    flipV,
    flipH,
    resetViewport,
    clearTools,
};

export { viewportUtils };
