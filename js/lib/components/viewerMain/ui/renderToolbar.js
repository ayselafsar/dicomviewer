import Handlebars from 'handlebars';
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
    const source = $('#toolbarTemplate').html();
    const template = Handlebars.compile(source);
    $('#toolbar').html(template({
        hasMultipleInstances: DCMViewer.ui.hasMultipleInstances
    }));

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
    }, 300);
};