import { StackImagePositionOffsetSynchronizer } from '../viewerbase/classes/StackImagePositionOffsetSynchronizer';

/**
 * Manages all global variables, sessions and collections
 */
const DCMViewerManager = {
    stackImagePositionOffsetSynchronizer: new StackImagePositionOffsetSynchronizer(),
    defaultTool: undefined,
    settings: {
        public: {
            defaultMouseButtonTools: undefined,
            defaultGestures: {
                zoomTouchPinch: undefined,
                stackScrollMultiTouch: undefined,
                panMultiTouch: undefined,
                doubleTapZoom: undefined,
            }
        }
    },
    sessions: {

    }
};

export { DCMViewerManager };
