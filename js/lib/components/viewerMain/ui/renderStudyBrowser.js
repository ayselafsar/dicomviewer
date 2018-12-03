import $ from 'jquery';
import slimscroll from 'jquery-slimscroll';
import Handlebars from 'handlebars';
import { _ } from 'underscore';
import { DCMViewer } from '../index';

// Enable scrollbar for study browser section when page is resized
const handleStudyBrowserScrollbar = _.throttle(() => {
    const $studyBrowser = $('#studyBrowser');
    let parentHeight = $studyBrowser.height();
    parentHeight = `${parentHeight}px`;

    $('.scrollableStudyThumbnails').slimscroll({
        height: parentHeight,
        size: '14px',
        color: '#163239',
        alwaysVisible: true,
        distance: '5px',
        opacity: 1,
        allowPageScroll: false,
        disableFadeOut: false
    });

    // Add style to scrollbar when it is active
    const $slimScrollBar = $('.slimScrollBar');
    $slimScrollBar.on('mousedown', function () {
        $(this).addClass('slimScrollBarActive');
    });

    $(document).on('mouseup', function () {
        if (!$slimScrollBar.hasClass('slimScrollBarActive')) {
            return;
        }

        $slimScrollBar.removeClass('slimScrollBarActive');
    });
}, 300);

/**
 * Renders study browser
 */
export default function renderStudyBrowser() {
    const imageThumbnailSource = $('#imageThumbnailTemplate').html();
    Handlebars.registerPartial('imageThumbnail', imageThumbnailSource);

    const source = $('#studyBrowserTemplate').html();
    const { studies } = DCMViewer.viewerbase.data;

    const template = Handlebars.compile(source);
    const html = template({
        studies,
    });

    $('#studyBrowser').html(html);

    // Show scrollbar if needed
    handleStudyBrowserScrollbar();

    $(window).on('resize', handleStudyBrowserScrollbar);
}
