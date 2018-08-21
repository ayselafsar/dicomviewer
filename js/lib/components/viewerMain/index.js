import viewerbase from './viewerbase/index';
import { tools } from './tools';
import { ui } from './ui';
import { Viewerbase } from '../viewerbase';

const DCMViewer = {
    cornerstone: {
        MetadataProvider: Viewerbase.MetadataProvider,
    },
    viewerbase,
    metadata: {
        InstanceMetadata: Viewerbase.metadata.InstanceMetadata,
        SeriesMetadata: Viewerbase.metadata.SeriesMetadata,
        StudyMetadata: Viewerbase.metadata.StudyMetadata
    },
    viewer: {
        Studies: [],
        StudyMetadataList: []
    },
    tools,
    ui: {
        renderViewer: ui.renderViewer,
    },

};

export { DCMViewer };
