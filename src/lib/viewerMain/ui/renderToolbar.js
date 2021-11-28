import $ from 'jquery';
import { DCMViewer } from '../index';
import { tools } from '../tools/';

function toggleSeriesPanel() {
    const $toggleSeriesPanel = $('.toggleSeriesPanel');
    const $toggleSeriesPanelButton = $('.toggleSeriesPanelButton');

    $toggleSeriesPanel.click(() => {
        const $sidebarMenu = $('.sidebarMenu');
        const $mainContent = $('.mainContent');

        if ($sidebarMenu.hasClass('sidebar-open')) {
            $sidebarMenu.removeClass('sidebar-open');
            $toggleSeriesPanelButton.removeClass('active');
            $mainContent.addClass('content-full');
        } else {
            $sidebarMenu.addClass('sidebar-open');
            $toggleSeriesPanelButton.addClass('active');
            $mainContent.removeClass('content-full');
        }

        // Resize viewport
        setTimeout(() => {
            const viewportElement = $('.imageViewerViewport').get(0);
            window.ResizeViewportManager.resizeViewportElement(viewportElement);
        }, 300);
    });
}

/**
 * Renders toolbar and actions
 */
export default function renderToolbar() {
    // Wait until all DOM is rendered
    setTimeout(() => {
        // Enable to toggle series panel
        toggleSeriesPanel();

        // Handle toolbar actions
        const commandsManager = tools.registerTools();
        tools.createToolbar(commandsManager);

        // Close viewer if close icon is clicked
        $('.js-close-viewer').click(() => {
            DCMViewer.ui.closeViewer();
        });

        // Expand toolbar
        const $moreTools = $('.js-more-tools');
        $moreTools.click(() => {
            const $toolbarSectionTools = $('.toolbarSectionTools');
            const className = 'expandedToolbar';

            if ($toolbarSectionTools.hasClass(className)) {
                $toolbarSectionTools.removeClass(className);
            } else {
                $toolbarSectionTools.addClass(className);
            }

            // Rotate arrow icon
            const $moreIcon = $moreTools.find('.svgContainer');
            const $moreText = $moreTools.find('span');

            if ($moreIcon.hasClass('rotate-180')) {
                $moreIcon.removeClass('rotate-180');
                $moreText.text(t('dicomviewer', 'More'));
            } else {
                $moreIcon.addClass('rotate-180');
                $moreText.text(t('dicomviewer', 'Less'));
            }

            // Resize viewport
            setTimeout(() => {
                const viewportElement = $('.imageViewerViewport').get(0);
                window.ResizeViewportManager.resizeViewportElement(viewportElement);
            }, 300);
        });
    }, 300);
}
