import $ from 'jquery';
import initializeSidebarPreview from '../initializeSidebarPreview';
import Sidebar from '../../templates/Sidebar.html';

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
        // Clear timer if needed
        if (this.sidebarCheckTimer) {
            clearInterval(this.sidebarCheckTimer);
        }

        // Wait until sidebar is rendered
        this.sidebarCheckTimer = setInterval(() => {
            const $appSidebar = $('#app-sidebar');
            if (!$appSidebar) {
                return;
            }

            // Clear timer
            clearInterval(this.sidebarCheckTimer);

            const fileDownloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));

            const $previewDiv = $("<div id='sidebar_dicomviewer'/>");

            $thumbnailDiv.removeClass('icon-loading icon-32');
            $thumbnailContainer.addClass('large');
            $thumbnailContainer.addClass('text');
            $thumbnailContainer.addClass('thumbnailContainer-dicomviewer');
            $thumbnailDiv.children('.stretcher').remove();

            $previewDiv.append(Sidebar);
            $thumbnailDiv.append($previewDiv);

            const setPreviewSize = () => {
                const previewHeight = ($appSidebar.height() * (2 / 3));
                $thumbnailContainer.css('height', previewHeight);
                $previewDiv.css('height', previewHeight);
            };

            setPreviewSize();

            // Adjust the preview size on window resized
            $(window).on('resize', () => setPreviewSize());

            // Prevent open on click in preview
            $previewDiv.on('click', e => e.stopPropagation());

            // Initialize sidebar
            initializeSidebarPreview(fileDownloadUrl);
        }, 300);
    }
}

export default SidebarPreview;
