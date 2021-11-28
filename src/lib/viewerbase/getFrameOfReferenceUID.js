import { cornerstone } from '../cornerstonejs';

/**
 * Helper function to quickly obtain the frameOfReferenceUID
 * for a given element from the enabled image's metadata.
 *
 * If no image, imagePlane, or frameOfReferenceUID is available,
 * the function will return undefined.
 *
 * @param element
 * @returns {string}
 */
export function getFrameOfReferenceUID(element) {
    let enabledElement;
    try {
        enabledElement = cornerstone.getEnabledElement(element);
    } catch (error) {
        return;
    }

    if (!enabledElement || !enabledElement.image) {
        return;
    }

    const { imageId } = enabledElement.image;
    const imagePlane = cornerstone.metaData.get('imagePlane', imageId);
    if (!imagePlane || !imagePlane.frameOfReferenceUID) {
        return;
    }

    return imagePlane.frameOfReferenceUID;
}
