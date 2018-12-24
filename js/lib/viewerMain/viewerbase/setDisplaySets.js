import { StudyMetadata } from '../../viewerbase/classes/metadata/viewerMain/StudyMetadata';
import { Viewerbase } from '../../viewerbase/index';

export default function setDisplaySets(studies) {
    studies.forEach((study) => {
        const studyMetadata = new StudyMetadata(study, study.studyInstanceUid);
        let { displaySets } = study;

        if (!study.displaySets) {
            displaySets = Viewerbase.sortingManager.getDisplaySets(studyMetadata);
            study.displaySets = displaySets;
        }
    });
}
