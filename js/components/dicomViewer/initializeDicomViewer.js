import $ from 'jquery';
import { cornerstone } from '../../lib/cornerstonejs';
import loadAndViewImage from './lib/loadAndViewImage';
import updateImageOverlays from './lib/updateImageOverlays';
import registerTools from './tools/registerTools';
import createToolbar from './tools/createToolbar';

export default function (baseUrl, downloadUrl, callback) {
    const imageId = `wadouri:${baseUrl}${downloadUrl}`;
    const $imageViewerViewport = $('.imageViewerViewport');
    const $loadProgress = $('.load-progress-content');
    const element = $imageViewerViewport.get(0);

    // Register the viewer tools
    const commandManager = registerTools();
    createToolbar(commandManager);

    // Update dicom image container attributes to disallow manipulating viewer
    $imageViewerViewport.on('contextmenu', () => false);
    $imageViewerViewport.on('mousedown', () => false);
    $imageViewerViewport.on('selectstart', () => false);
    $imageViewerViewport.on('contextmenu', () => false);

    $imageViewerViewport.on('cornerstoneimagerendered', (e) => {
        const viewport = cornerstone.getViewport(e.target);

        const $zoomLevel = $('#zoomLevel');
        const $windowLevel = $('#windowLevel');

        $zoomLevel.text(`Zoom: ${viewport.scale.toFixed(2)}`);
        $windowLevel.text(`WW/WC: ${Math.round(viewport.voi.windowWidth)} / ${Math.round(viewport.voi.windowCenter)}`);
    });

    cornerstone.events.addEventListener('cornerstoneimageloadprogress', (event) => {
        // Update load progress
        const eventData = event.detail;
        $loadProgress.text(`Loading... ${eventData.percentComplete}%`);
    });

    element.addEventListener('cornerstonenewimage', (e) => {
        const { image } = e.detail;
        updateImageOverlays(imageId, image);

        // Hide load progress
        $loadProgress.css({
            display: 'none',
        });
    });

    $(window).resize(() => {
        if (!element) {
            return;
        }

        cornerstone.resize(element, true);
    });

    // Display image
    loadAndViewImage(element, imageId);

    callback();
}
