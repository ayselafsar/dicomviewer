// Add MimeType Icon
OC.MimeType._mimeTypeIcons['application/dicom'] = '/apps/dicomviewer/img/app-dark.svg';

(function (OCA) {
    OCA.DICOMViewer = OCA.DICOMViewer || {};

    /**
     * @namespace OCA.DICOMViewer.DICOMViewerPlugin
     */
    OCA.DICOMViewer.DICOMViewerPlugin = {
        mimeType: 'application/dicom',

        /**
         * Initialize DICOMViewerPlugin actions
         * @param fileList
         */
        attach: function (fileList) {
            this._registerFileActions(fileList.fileActions);
        },

        /**
         * Hide viewer dialog
         */
        hide: function () {
            $('#dcmframe').remove();

            FileList.setViewerMode(false);
        },

        /**
         * Display viewer dialog
         * @param downloadUrl
         */
        show: function (downloadUrl) {
            const baseUrl = `${OC.getProtocol()}://${OC.getHost()}`;
            const self = this;
            let shown = true;

            const viewer = OC.generateUrl('/apps/dicomviewer/?file={file}', {
                file: downloadUrl
            });

            const $iframe = $(`<iframe id="dcmframe" data-base-url="${baseUrl}" data-download-url="${downloadUrl}" src="${viewer}" sandbox="allow-scripts allow-same-origin allow-popups allow-top-navigation" />`);

            FileList.setViewerMode(true);

            $('#app-content').after($iframe);

            // Close viewer
            $iframe.load(() => {
                const iframe = $iframe.contents();

                if ($('#fileList').length) {
                    // Handle close button
                    iframe.find('.js-close-viewer').click(() => {
                        self.hide();
                    });

                    // Go back on ESC
                    $(document).keyup((e) => {
                        if (shown && e.keyCode === 27) {
                            shown = false;
                            self.hide();
                        }
                    });
                } else {
                    iframe.find('.js-close-viewer').addClass('hidden');
                }
            });

            if (!$('html').hasClass('ie8')) {
                history.pushState({}, '', '#dcmviewer');
            }

            if (!$('html').hasClass('ie8')) {
                $(window).one('popstate', () => {
                    self.hide();
                });
            }
        },

        /**
         * Register file actions for dcm files
         * @param fileActions
         * @private
         */
        _registerFileActions: function (fileActions) {
            const self = this;

            fileActions.registerAction({
                name: 'view',
                displayName: 'DICOM Viewer',
                mime: self.mimeType,
                permissions: OC.PERMISSION_READ,
                templateName: 'viewer',
                actionHandler: (fileName, context) => {
                    const downloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
                    if (downloadUrl && downloadUrl !== '#') {
                        self.show(downloadUrl, true);
                    }
                },
            });

            // Add default action
            fileActions.setDefault(self.mimeType, 'view');
        },
    };
}(OCA));

OC.Plugins.register('OCA.Files.FileList', OCA.DICOMViewer.DICOMViewerPlugin);
