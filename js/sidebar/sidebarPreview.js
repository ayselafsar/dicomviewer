(function () {
    const SidebarPreview = function () {};

    SidebarPreview.prototype = {
        attach: function (manager) {
            const mimeType = 'application/dicom';
            const handler = this.handlePreview.bind(this);

            manager.addPreviewHandler(mimeType, handler);
        },

        handlePreview: function (model, $thumbnailDiv, $thumbnailContainer) {
            const baseUrl = `${OC.getProtocol()}://${OC.getHost()}`;
            const downloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));
            const viewer = OC.generateUrl('/apps/dicomviewer/dicomSidebar?file={file}', {
                file: downloadUrl,
            });

            // Create an iframe to import sidebar content
            const $appSidebar = $('#app-sidebar');
            const appSidebarHeight = $appSidebar.height();
            const previewHeight = parseInt(appSidebarHeight, 10) / 2;
            const sandboxProperties = 'allow-scripts allow-same-origin allow-popups allow-modals';
            const $iframe = $(`<iframe id="sidebarframe" style="height:${previewHeight}px" data-base-url="${baseUrl}" data-download-url="${downloadUrl}" src="${viewer}" sandbox="${sandboxProperties}" />`);

            $thumbnailDiv.append($iframe);

            $iframe.on('load', () => {
                $thumbnailDiv.removeClass('icon-loading icon-32');
                $thumbnailContainer.addClass('large');
                $thumbnailDiv.children('.stretcher').remove();
                $thumbnailContainer.css('height', previewHeight);
            });

            $(window).resize(() => {
                const frameHeight = parseInt($appSidebar.height(), 10) / 2;
                $thumbnailContainer.css('height', frameHeight);
                $iframe.height(frameHeight);
            });
        },
    };

    OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview());
}());
