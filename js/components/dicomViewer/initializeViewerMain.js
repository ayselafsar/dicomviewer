import $ from 'jquery';
import { cornerstone } from '../../lib/cornerstonejs';
import { DCMViewer } from '../../lib/components/viewerMain/index';
import { DCMViewerError } from '../../lib/components/DCMViewerError';
import { DCMViewerLog } from '../../lib/components/DCMViewerLog';

export default function initializeViewerMain(viewerPromise) {
    viewerPromise.then((viewerData) => {
        // Hide loading view
        $('.loadingViewerMain').css({ display: 'none' });

        DCMViewer.ui.hasMultipleInstances = false;

        // Manage resizing of viewport
        window.ResizeViewportManager = window.ResizeViewportManager || new DCMViewer.viewerbase.ResizeViewportManager();

        window.addEventListener('resize', window.ResizeViewportManager.getResizeHandler());

        // Reload previous series data
        if (DCMViewer.viewer.data && DCMViewer.viewer.data.loadedSeriesData) {
            DCMViewerLog.info('Reloading previous loadedSeriesData');
            DCMViewer.viewer.loadedSeriesData = DCMViewer.viewer.data.loadedSeriesData;
        } else {
            DCMViewerLog.info('Setting default viewer data');
            DCMViewer.viewer.loadedSeriesData = {};
            DCMViewer.viewer.data = {};
            DCMViewer.viewer.data.loadedSeriesData = DCMViewer.viewer.loadedSeriesData;

            // Update the viewer data object
            DCMViewer.viewer.data.viewportColumns = 1;
            DCMViewer.viewer.data.viewportRows = 1;
            DCMViewer.viewer.data.activeViewport = 0;
        }

        // Update Studies
        DCMViewer.viewer.studies = [];
        DCMViewer.viewer.StudyMetadataList = [];

        DCMViewer.viewer.data.studyInstanceUids = [];
        viewerData.studies.forEach((study) => {
            const studyMetadata = new DCMViewer.metadata.StudyMetadata(study, study.studyInstanceUid);
            let { displaySets } = study;

            if (!study.displaySets) {
                displaySets = DCMViewer.viewerbase.sortingManager.getDisplaySets(studyMetadata);
                study.displaySets = displaySets;
            }

            // Sort display sets
            studyMetadata.setDisplaySets(displaySets);
            studyMetadata.sortSeriesByDisplaySets();

            study.selected = true;
            DCMViewer.viewer.Studies.push(study);
            DCMViewer.viewer.StudyMetadataList.push(studyMetadata);
            DCMViewer.viewer.data.studyInstanceUids.push(study.studyInstanceUid);

            const hasMultipleInstances = study.seriesList.filter(series => series.instances.length > 1);

            if (hasMultipleInstances.length && !DCMViewer.ui.hasMultipleInstances) {
                DCMViewer.ui.hasMultipleInstances = true;
            }
        });

        DCMViewer.viewerbase.data = viewerData;

        DCMViewer.viewer.metadataProvider = new DCMViewer.cornerstone.MetadataProvider();
        const metaDataProvider = DCMViewer.viewer.metadataProvider;
        cornerstone.metaData.addProvider(metaDataProvider.provider.bind(metaDataProvider));

        // Render all content
        DCMViewer.ui.renderViewer();
    }).catch(() => new DCMViewerError('Couldn\'t initialize viewer'));
}
