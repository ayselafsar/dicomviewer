import { cornerstone, cornerstoneTools } from '../../../lib/cornerstonejs';
import { MetadataProvider } from '../classes/MetadataProvider';
import { toolManager } from '../tools/toolManager';
import updateOrientationMarkers from './updateOrientationMarkers';

/**
 * Load and view image
 * @param element
 * @param imageId
 */
export default function (element, imageId) {
    const metadataProvider = new MetadataProvider();
    cornerstone.metaData.addProvider(metadataProvider.provider.bind(metadataProvider));

    try {
        cornerstone.enable(element);
        cornerstone.loadAndCacheImage(imageId).then((image) => {
            // Add metadata to store image data
            metadataProvider.addMetadata(imageId, image.data);

            const viewport = cornerstone.getDefaultViewportForImage(element, image);
            cornerstone.displayImage(element, image, viewport);

            // Display orientation markers
            updateOrientationMarkers(element, viewport);

            // Enable mouse, mouseWheel, touch, and keyboard input on the element
            cornerstoneTools.mouseInput.enable(element);
            cornerstoneTools.touchInput.enable(element);
            cornerstoneTools.mouseWheelInput.enable(element);
            cornerstoneTools.keyboardInput.enable(element);

            // Use the tool manager to enable the currently active tool for this
            // newly rendered element
            const activeTool = toolManager.getActiveTool();
            toolManager.setActiveTool(activeTool, [element]);
        }, (err) => {
            console.error(err);
        });
    } catch (err) {
        console.error(err);
    }
}
