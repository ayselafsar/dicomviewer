import { StudyMetadata } from '../../viewerbase/classes/metadata/viewerMain/StudyMetadata';
import { Viewerbase } from '../../viewerbase/index';

export default function setDisplaySets(studies) {
    studies.forEach(study => {
        const studyMetadata = new StudyMetadata(study, study.studyInstanceUid);
        let displaySets = study.displaySets;

        if(!study.displaySets) {
            displaySets = Viewerbase.sortingManager.getDisplaySets(studyMetadata);
            study.displaySets = displaySets;
        }

        // study.selected = true;
        // OHIF.viewer.Studies.insert(study);
        // OHIF.viewer.StudyMetadataList.insert(studyMetadata);
        // OHIF.viewer.data.studyInstanceUids.push(study.studyInstanceUid);
    });
}