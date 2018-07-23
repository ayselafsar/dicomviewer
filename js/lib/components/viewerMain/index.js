import viewerbase from './viewerbase/index';
import { Viewerbase } from '../viewerbase';

const DCMViewer = {
    viewerbase,
    metadata: {
        InstanceMetadata: Viewerbase.metadata.InstanceMetadata,
        SeriesMetadata: Viewerbase.metadata.SeriesMetadata,
        StudyMetadata: Viewerbase.metadata.StudyMetadata
    },
};

export { DCMViewer };