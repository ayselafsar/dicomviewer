import { getWADORSImageUrl } from './getWADORSImageUrl';
import { DCMViewerLog } from '../DCMViewerLog';

/**
 * Obtain an imageId for Cornerstone based on the WADO-RS scheme
 *
 * @param {object} instanceMetada metadata object (InstanceMetadata)
 * @returns {string} The imageId to be used by Cornerstone
 */
export function getWADORSImageId(instance, frame) {
    const uri = getWADORSImageUrl(instance, frame);

    if (!uri) {
        return;
    }

    const imageId = `wadors:${uri}`;

    DCMViewerLog.info('WADO-RS ImageID: ' + imageId);

    return imageId;
}
