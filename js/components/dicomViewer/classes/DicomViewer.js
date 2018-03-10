import $ from 'jquery';
import initalizeDicomViewer from '../initializeDicomViewer';
import configureCodecs from '../configureCodecs';

class DicomViewer {
    constructor() {
        this.mimeType = 'application/dicom';
        this.baseUrl = `${OC.getProtocol()}://${OC.getHost()}`;
        this.shown = false;

        configureCodecs(this.baseUrl);
    }

    /**
     * Initialize DICOMViewerPlugin actions
     * @param fileList
     */
    attach(fileList) {
        this._registerFileActions(fileList.fileActions);
    }

    /**
     * Hide viewer dialog
     */
    hide() {
        this.shown = false;

        $('#viewer').remove();
        $('#app-content-files').css({ display: 'block' });

        FileList.setViewerMode(false);
    }

    /**
     * Display viewer dialog
     * @param downloadUrl
     */
    show(downloadUrl) {
        const self = this;
        self.shown = true;

        const viewer = OC.generateUrl('/apps/dicomviewer/?file={file}', {
            file: downloadUrl
        });

        $.ajax({
            url: viewer,
            type: 'GET',
            contentType: 'text/html',
        }).done((response) => {
            const $appContent = $('#app-content');

            const callback = () => {
                $('.js-close-viewer').click(() => {
                    self.hide();
                });
            };

            // Go back on ESC
            $(document).keyup((e) => {
                // Stop if there is an open dialog
                const isModalShown = $('.modal-backdrop').hasClass('show');
                if (self.shown && e.keyCode === 27 && !isModalShown) {
                    self.hide();
                }
            });

            $('#app-content-files').css({ display: 'none' });
            $appContent.append(response);

            // Initialize viewer
            initalizeDicomViewer(self.baseUrl, downloadUrl, callback);
        }).fail((response, code) => {
            console.error(response, code);
        });

        FileList.setViewerMode(true);

        if (!$('html').hasClass('ie8')) {
            history.pushState({}, '', '#dcmviewer');
        }

        if (!$('html').hasClass('ie8')) {
            $(window).one('popstate', () => {
                self.hide();
            });
        }
    }

    /**
     * Register file actions for dcm files
     * @param fileActions
     * @private
     */
    _registerFileActions(fileActions) {
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
    }
}

export default DicomViewer;
