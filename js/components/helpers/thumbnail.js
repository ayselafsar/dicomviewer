import $ from 'jquery';
import { _ } from 'underscore';
import Handlebars from 'handlebars';
import { cornerstone } from '../../lib/cornerstonejs';
import { DCMViewer } from '../../lib/viewerMain';

/**
 * Create data for thumbnails
 *
 */
Handlebars.registerHelper('studyThumbnails', (study) => {
    if (!study) {
        return;
    }

    // Find the study's stacks
    const stacks = study.displaySets;

    // Defines the resulting thumbnails list
    const thumbnails = [];

    // Iterate over the stacks and add one by one with its index
    _.each(stacks, (stack, thumbnailIndex) => {
        thumbnails.push({
            thumbnailIndex,
            stack
        });
    });

    return thumbnails;
});


function getThumbnailImageId(stack) {
    const useMiddleFrame = true;
    const lastIndex = (stack.numImageFrames || stack.images.length || 1) - 1;
    let imageIndex = useMiddleFrame ? Math.floor(lastIndex / 2) : 0;
    let imageInstance;

    if (stack.isMultiFrame) {
        imageInstance = stack.images[0];
    } else {
        imageInstance = stack.images[imageIndex];
        imageIndex = undefined;
    }

    return imageInstance.getImageId(imageIndex, true);
}


/**
 * Render each thumbnail image
 *
 */
Handlebars.registerHelper('imageThumbnailCanvas', function () {
    setTimeout(() => {
        const { stack } = this;
        const { isActiveStudy } = this;
        const activeThumbnail = (this.thumbnailIndex === 0);
        const thumbnailCanvasId = `imageThumbnailCanvas${stack.seriesNumber}_${stack.displaySetInstanceUid}`;

        const imageId = getThumbnailImageId(stack);

        const $element = $(`#${thumbnailCanvasId}`);
        const element = $element.get(0);

        // Highlight active thumbnail
        if (isActiveStudy && activeThumbnail) {
            $element.parent('.imageThumbnail').addClass('active');
        }

        // Enable element
        cornerstone.enable(element);

        // Display image in thumbnail
        cornerstone.loadAndCacheImage(imageId).then(function (image) {
            cornerstone.displayImage(element, image);
        });

        // Activate series if clicked
        $element.click(() => {
            DCMViewer.layoutManager.rerenderViewportWithNewDisplaySet(0, stack);

            // Highlight active series
            $('.imageThumbnail').removeClass('active');
            $element.parent('.imageThumbnail').addClass('active');
        });
    }, 300);
});

/**
 * List all modalities inside a study
 *
 */
Handlebars.registerHelper('modalitiesList', (study) => {
    if (!study) {
        return;
    }

    const { seriesList } = study;

    if (!seriesList) {
        return;
    }

    return seriesList.map(series => series.modality).join(', ');
});
