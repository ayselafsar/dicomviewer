import { StackImagePositionOffsetSynchronizer } from './viewerbase/classes/StackImagePositionOffsetSynchronizer';

/**
 * Manages all global variables, sessions and collections
 */
const DCMViewerManager = {
    stackImagePositionOffsetSynchronizer: new StackImagePositionOffsetSynchronizer(),
    sessions: {}
};

export { DCMViewerManager };
