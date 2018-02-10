import $ from 'jquery';
import initializeSidebarPreview from '../initializeSidebarPreview';

class SidebarPreview {
    constructor() {
        this.mimeType = 'application/dicom';
    }

    attach(manager) {
        const handler = this.handlePreview.bind(this);

        manager.addPreviewHandler(this.mimeType, handler);
    }

    handlePreview(model, $thumbnailDiv, $thumbnailContainer) {
        const baseUrl = `${OC.getProtocol()}://${OC.getHost()}`;
        const downloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));

        const sidebar = OC.generateUrl('/apps/dicomviewer/dicomSidebar?file={file}', {
            file: downloadUrl,
        });

        // Create an iframe to import sidebar content
        const $appSidebar = $('#app-sidebar');
        const appSidebarHeight = $appSidebar.height();
        const previewHeight = parseInt(appSidebarHeight, 10) / 2;

        $.ajax({
            url: sidebar,
            type: 'GET',
            contentType: 'text/html',
        }).done((response) => {
            $thumbnailDiv.removeClass('icon-loading icon-32');
            $thumbnailContainer.addClass('large');
            $thumbnailDiv.children('.stretcher').remove();
            $thumbnailContainer.css('height', previewHeight);

            $thumbnailContainer.html(response);

            $(window).on('resize', () => {
                const frameHeight = parseInt($appSidebar.height(), 10) / 2;
                $thumbnailContainer.css('height', frameHeight);
            });

            initializeSidebarPreview(baseUrl, downloadUrl);
        }).fail((response, code) => {
            console.error(response, code);
        });
    }
}

export default SidebarPreview;
