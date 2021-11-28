import $ from 'jquery';
import { cornerstone } from '../../lib/cornerstonejs';

export function getElementIfNotEmpty(viewportIndex) {
    const imageViewerViewports = $('.imageViewerViewport');
    const element = imageViewerViewports.get(viewportIndex);
    const canvases = imageViewerViewports.eq(viewportIndex).find('canvas');

    if (!element || $(element).hasClass('empty') || canvases.length === 0) {
        return;
    }

    // Check to make sure the element is enabled.
    try {
        cornerstone.getEnabledElement(element);
    } catch (error) {
        return;
    }

    return element;
}
