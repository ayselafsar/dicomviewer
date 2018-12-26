import { StudyMetadata } from './classes/metadata/viewerMain/StudyMetadata';

const getStudyMetadata = (study) => {
    let studyMetadata = study;
    if (study && !(studyMetadata instanceof StudyMetadata)) {
        studyMetadata = new StudyMetadata(study, study.studyInstanceUid);
    }

    return studyMetadata;
};

export { getStudyMetadata };
