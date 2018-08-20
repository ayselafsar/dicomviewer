import $ from 'jquery';
import Handlebars from 'handlebars';
import { _ } from 'underscore';
import { cornerstone } from '../../lib/cornerstonejs';
import { DCMViewer } from '../../lib/components/viewerMain';

/**
 * Create data for thumbnail
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
 * Render each thumbnail
 */
Handlebars.registerHelper('renderThumbnail', function () {
    const { stack } = this;
    const { seriesNumber } = stack;
    const { displaySetInstanceUid } = stack;

    const imageId = getThumbnailImageId(stack);

    // Wait until DOM is rendered
    setTimeout(() => {
        const elementId = `imageThumbnailCanvas${seriesNumber}_${displaySetInstanceUid}`;
        const $element = $(`#${elementId}`);
        const element = $element.get(0);

        // Enable element
        cornerstone.enable(element);

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

