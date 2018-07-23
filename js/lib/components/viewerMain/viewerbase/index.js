import { Viewerbase } from '../../viewerbase/index';

import setDisplaySets from './setDisplaySets';

const viewerbase = {
    data: {
            loadedSeriesData: {}
        },
    instance: {},
    loadedSeriesData: {},
    setDisplaySets,
    StudyPrefetcher: Viewerbase.StudyPrefetcher,
    StudyLoadingListener: Viewerbase.StudyLoadingListener,
    LayoutManager: Viewerbase.LayoutManager
};

export default viewerbase;