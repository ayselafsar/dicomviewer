import { cornerstone } from '../../../cornerstonejs';
import { getInstanceClassDefaultViewport } from '../instanceClassSpecificViewport';
import { DCMViewerLog } from '../../DCMViewerLog';

// Manage resizing viewports triggered by window resize
export class ResizeViewportManager {
    constructor() {
        this._resizeHandler = null;
    }

    // Relocate dialogs positions
    relocateDialogs(){
        DCMViewerLog.info('ResizeViewportManager relocateDialogs');

        const $bottomRightDialogs = $('#annotationDialog, #textMarkerOptionsDialog');
        $bottomRightDialogs.css({
            top: '', // This removes the CSS property completely
            left: '',
            bottom: 0,
            right: 0
        });

        const centerDialogs = $('.draggableDialog').not($bottomRightDialogs);

        centerDialogs.css({
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        });
    }

    // Resize viewport scrollbars
    resizeScrollbars(element) {
        DCMViewerLog.info('ResizeViewportManager resizeScrollbars');

        const $currentOverlay = $(element).siblings('.imageViewerViewportOverlay');
        $currentOverlay.find('.scrollbar').trigger('rescale');
    }

    // Resize a single viewport element
    resizeViewportElement(element, fitToWindow = true) {
        let enabledElement;
        try {
            enabledElement = cornerstone.getEnabledElement(element);
        } catch(error) {
            return;
        }

        cornerstone.resize(element, fitToWindow);

        if (enabledElement.fitToWindow === false) {
            const imageId = enabledElement.image.imageId;
            const instance = cornerstone.metaData.get('instance', imageId);
            const instanceClassViewport = getInstanceClassDefaultViewport(instance, enabledElement, imageId);
            cornerstone.setViewport(element, instanceClassViewport);
        }
    }

    // Resize each viewport element
    resizeViewportElements() {
        this.relocateDialogs();

        setTimeout(() => {
            const elements = $('.imageViewerViewport').not('.empty');
            elements.each((index, element) => {
                this.resizeViewportElement(element);
                this.resizeScrollbars(element);
            });
        }, 1);
    }

    // Function to override resizeViewportElements function
    setResizeViewportElement(resizeViewportElements) {
        this.resizeViewportElements = resizeViewportElements;
    }

    // Avoid doing DOM manipulation during the resize handler
    // because it is fired very often.
    // Resizing is therefore performed 100 ms after the resize event stops.
    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            DCMViewerLog.info('ResizeViewportManager resizeViewportElements');
            this.resizeViewportElements();
        }, 100);
    }

    /**
     * Returns a unique event handler function associated with a given instance using lazy assignment.
     * @return {function} Returns a unique copy of the event handler of this class.
     */
    getResizeHandler() {
        let resizeHandler = this._resizeHandler;
        if (resizeHandler === null) {
            resizeHandler = this.handleResize.bind(this);
            this._resizeHandler = resizeHandler;
        }

        return resizeHandler;
    }
}
