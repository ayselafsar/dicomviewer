import $ from 'jquery';
import { cornerstone } from '../../../lib/cornerstonejs';
import formatDate from '../../../lib/formatDate';

function getCompression(instance) {
    if (instance.lossyImageCompression === '01' &&
        instance.lossyImageCompressionRatio !== '') {
        const compressionMethod = instance.lossyImageCompressionMethod || 'Lossy: ';
        const compressionRatio = parseFloat(instance.lossyImageCompressionRatio).toFixed(2);
        return `${compressionMethod} ${compressionRatio} : 1`;
    }

    return 'Lossless / Uncompressed';
}

/**
 *
 * @param imageId
 * @param image
 */
export default function (imageId, image) {
    const patient = cornerstone.metaData.get('patient', imageId);
    const study = cornerstone.metaData.get('study', imageId);
    const series = cornerstone.metaData.get('series', imageId);
    const instance = cornerstone.metaData.get('instance', imageId);

    $('#patientName').text(patient.name);
    $('#patientId').text(patient.id);

    $('#studyDescription').text(study.studyDescription);
    $('#studyDate').text(formatDate(study.studyDate));

    $('#compression').text(getCompression(instance));

    $('#seriesNumber').text(`Ser: ${series.seriesNumber}`);
    $('#instanceNumber').text(`Img #: ${series.numImages}`);
    $('#dimensions').text(`${image.width} x ${image.height}`);
    $('#seriesDescription').text(series.seriesDescription);
}
