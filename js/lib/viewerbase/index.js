import { ImageSet } from './classes/ImageSet';
import { BaseInstanceMetadata } from './classes/metadata/BaseInstanceMetadata';
import { BaseSeriesMetadata } from './classes/metadata/BaseSeriesMetadata';
import { BaseStudyMetadata } from './classes/metadata/BaseStudyMetadata';
import { InstanceMetadata } from './classes/metadata/viewerMain/InstanceMetadata';
import { SeriesMetadata } from './classes/metadata/viewerMain/SeriesMetadata';
import { StudyMetadata } from './classes/metadata/viewerMain/StudyMetadata';
import { LayoutManager } from './classes/LayoutManager';
import { MetadataProvider } from './classes/MetadataProvider';
import { ResizeViewportManager } from './classes/ResizeViewportManager';
import { StudyLoadingListener } from './classes/StudyLoadingListener';
import { StudyPrefetcher } from './classes/StudyPrefetcher';
import { StackManager } from './StackManager';
import { DICOMTagDescriptions } from './DICOMTagDescriptions';
import { sopClassDictionary } from './sopClassDictionary';
import { isImage } from './isImage';
import { createStacks } from './createStacks';
import { getStackDataIfNotEmpty } from './getStackDataIfNotEmpty';
import { sortingManager } from './sortingManager';
import { updateOrientationMarkers } from './updateOrientationMarkers';
import { viewportOverlayUtils } from './viewportOverlayUtils';
import { viewportUtils } from './viewportUtils';
import { getStudyMetadata } from './getStudyMetadata';
import { getInstanceClassDefaultViewport } from './instanceClassSpecificViewport';
import { toolManager } from './toolManager';

const Viewerbase = {
    metadata: {
        BaseInstanceMetadata,
        BaseSeriesMetadata,
        BaseStudyMetadata,
        InstanceMetadata,
        SeriesMetadata,
        StudyMetadata
    },
    LayoutManager,
    MetadataProvider,
    ResizeViewportManager,
    StudyLoadingListener,
    StudyPrefetcher,
    ImageSet,
    DICOMTagDescriptions,
    StackManager,
    sopClassDictionary,
    isImage,
    createStacks,
    getStackDataIfNotEmpty,
    sortingManager,
    updateOrientationMarkers,
    viewportOverlayUtils,
    viewportUtils,
    getStudyMetadata,
    getInstanceClassDefaultViewport,
    toolManager
};

export { Viewerbase };
