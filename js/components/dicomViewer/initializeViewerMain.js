import { DCMViewer } from '../../lib/components/viewerMain/index';

function renderViewerMain() {
    if (!DCMViewer.instance) {
        DCMViewer.instance = {};
    }

    DCMViewer.instance.parentElement = $('#layoutManagerTarget');
    DCMViewer.instance.studyPrefetcher = DCMViewer.viewerbase.StudyPrefetcher.getInstance();
    DCMViewer.instance.studyLoadingListener = DCMViewer.viewerbase.StudyLoadingListener.getInstance();
    DCMViewer.instance.studyLoadingListener.clear();
    DCMViewer.instance.studyLoadingListener.addStudies(DCMViewer.viewerbase.data.studies);

    console.log('DICOM VIEWER ', DCMViewer);
}

export default function initializeViewerMain(getMetadataCallback, doneCallback) {
    doneCallback();

    const metadataCompleted = (viewerData) => {
        $('.viewerMainLoading').css({ display: 'none' });

        DCMViewer.viewerbase.data = viewerData;

        // Set displaySets
        DCMViewer.viewerbase.setDisplaySets(DCMViewer.viewerbase.data.studies);

        renderViewerMain();
    };

    getMetadataCallback(metadataCompleted);
}