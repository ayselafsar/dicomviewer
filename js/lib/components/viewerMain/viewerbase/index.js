import { Viewerbase } from '../../viewerbase/index';

import setDisplaySets from './setDisplaySets';

const viewerbase = {
    data: {
            loadedSeriesData: {}
        },
    instance: {},
    loadedSeriesData: {},
    getStackDataIfNotEmpty: Viewerbase.getStackDataIfNotEmpty,
    setDisplaySets,
    viewportOverlayUtils: Viewerbase.viewportOverlayUtils,
    sortingManager: Viewerbase.sortingManager,
    StudyPrefetcher: Viewerbase.StudyPrefetcher,
    StudyLoadingListener: Viewerbase.StudyLoadingListener,
    LayoutManager: Viewerbase.LayoutManager,
    ResizeViewportManager: Viewerbase.ResizeViewportManager
};

export default viewerbase;