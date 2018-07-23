export default function createMetadataJSON(wadouri, dataSet, studies) {
    const patientName = dataSet.string('x00100010');
    const patientId = dataSet.string('x00100020');
    const studyInstanceUid = dataSet.string('x0020000d');
    const seriesInstanceUid = dataSet.string('x0020000e');
    const seriesDescription = dataSet.string('x0008103e');
    const sopInstanceUid = dataSet.string('x00080018');
    const rows = dataSet.uint16('x00280010');

    const targetInstance = {
        sopInstanceUid,
        rows,
        url: wadouri
    };

    const targetSeries = {
        seriesInstanceUid,
        seriesDescription,
        instances: [targetInstance]
    };

    const targetStudy = {
        patientId,
        patientName,
        studyInstanceUid,
        seriesList: [targetSeries],
    };

    const study = studies.find(study => study.patientId === patientId);
    if (study) {
        study.seriesList = study.seriesList || [];
        const series = study.seriesList.find(series => series.seriesInstanceUid === seriesInstanceUid);
        if (series) {
            series.instances = series.instances || [];
            const instance = series.instances.find(instance => instance.sopInstanceUid === sopInstanceUid);
            if (!instance) {
                series.instances.push(targetInstance)
            }
        } else {
            study.seriesList.push(targetSeries)
        }
    } else {
        studies.push(targetStudy);
    }
}