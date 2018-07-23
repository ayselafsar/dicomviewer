import { ImageSet } from './classes/ImageSet';
import { BaseInstanceMetadata } from './classes/metadata/BaseInstanceMetadata';
import { BaseSeriesMetadata } from './classes/metadata/BaseSeriesMetadata';
import { BaseStudyMetadata } from './classes/metadata/BaseStudyMetadata';
import { LayoutManager } from './classes/LayoutManager';
import { StudyLoadingListener } from './classes/StudyLoadingListener';
import { StudyPrefetcher } from './classes/StudyPrefetcher';
import { StackManager } from './StackManager';
import { DICOMTagDescriptions } from './DICOMTagDescriptions';
import { sopClassDictionary } from './sopClassDictionary';
import { isImage } from './isImage';
import { createStacks } from './createStacks';
import { sortingManager } from './sortingManager';
import { viewportUtils } from './viewportUtils';
import { getStudyMetadata } from './getStudyMetadata';

const Viewerbase = {
    metadata: {
        InstanceMetadata: BaseInstanceMetadata,
        SeriesMetadata: BaseSeriesMetadata,
        StudyMetadata: BaseStudyMetadata,
    },
    LayoutManager,
    StudyLoadingListener,
    StudyPrefetcher,
    ImageSet,
    DICOMTagDescriptions,
    StackManager,
    sopClassDictionary,
    isImage,
    createStacks,
    sortingManager,
    viewportUtils,
    getStudyMetadata,
};

export { Viewerbase };