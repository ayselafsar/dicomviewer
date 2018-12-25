import '../../../external/jquery.slimscroll';
import $ from 'jquery';
import { _ } from 'underscore';
import { DCMViewer } from '../index';
import StudyBrowser from '../../../components/templates/StudyBrowser.html';

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
 * Renders study browser with studies
 */
export default function renderStudyBrowser() {
    const { studies } = DCMViewer.viewerbase.data;
    const $sidebarMenu = $('.sidebarMenu');
    const templateContent = StudyBrowser({
        studies: studies
    });

    $sidebarMenu.html(templateContent);

    // Show scrollbar if needed
    handleStudyBrowserScrollbar();

    $(window).on('resize', handleStudyBrowserScrollbar);
}
