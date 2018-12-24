import $ from 'jquery';
import initializeSidebarPreview from '../initializeSidebarPreview';
import Sidebar from '../../../../templates/Sidebar.html';

class SidebarPreview {
    constructor() {
        this.mimeType = 'application/dicom';
        this.sidebarCheckTimer = null;
    }

    attach(manager) {
        const handler = this.handlePreview.bind(this);

        manager.addPreviewHandler(this.mimeType, handler);
    }

    handlePreview(model, $thumbnailDiv, $thumbnailContainer) {
        // Wait until sidebar is rendered
        this.sidebarCheckTimer = setInterval(() => {
            const $appSidebar = $('#app-sidebar');
            const appSidebarHeight = parseInt($appSidebar.height(), 10);

            if (!appSidebarHeight) {
                return;
            }

            // Clear timer
            clearInterval(this.sidebarCheckTimer);

            const fileDownloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));

            const previewHeight = appSidebarHeight / 2;

            $thumbnailDiv.removeClass('icon-loading icon-32');
            $thumbnailContainer.addClass('large');
            $thumbnailDiv.children('.stretcher').remove();
            $thumbnailContainer.css('height', previewHeight);

            $thumbnailContainer.html(Sidebar);

            $(window).on('resize', () => {
                const frameHeight = parseInt($appSidebar.height(), 10) / 2;
                $thumbnailContainer.css('height', frameHeight);
            });

            // Initialize sidebar
            initializeSidebarPreview(fileDownloadUrl);
        }, 100);
    }
}

export default SidebarPreview;
