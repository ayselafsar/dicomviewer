import $ from 'jquery';
import initializeSidebarPreview from '../initializeSidebarPreview';
import Sidebar from '../../../../templates/Sidebar.html';

class SidebarPreview {
    constructor() {
        this.mimeType = 'application/dicom';
    }

    attach(manager) {
        const handler = this.handlePreview.bind(this);

        manager.addPreviewHandler(this.mimeType, handler);
    }

    handlePreview(model, $thumbnailDiv, $thumbnailContainer) {
        // Wait until sidebar is rendered
        setTimeout(() => {
            const fileDownloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));

            const $appSidebar = $('#app-sidebar');
            const appSidebarHeight = $appSidebar.height();
            const previewHeight = parseInt(appSidebarHeight, 10) / 2;

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
        }, 300);
    }
}

export default SidebarPreview;
