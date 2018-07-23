import $ from 'jquery';
import { cornerstoneWADOImageLoader } from '../../../lib/cornerstonejs';
import generateFullUrl from '../../../lib/generateFullUrl';
import initalizeDicomViewer from '../initializeDicomViewer';
import initializeViewerMain from '../initializeViewerMain';
import configureCodecs from '../configureCodecs';
import createMetadataJSON from '../lib/createMetadataJSON';

class DicomViewer {
    constructor() {
        this.mimeType = 'application/dicom';
        this.shown = false;
        this.isViewerMainShown = false;

        configureCodecs();
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
     * @param fileDownloadUrl
     */
    show(fileDownloadUrl) {
        const self = this;
        self.shown = true;

        const viewerUrl = OC.generateUrl('/apps/dicomviewer/?file={file}', {
            file: fileDownloadUrl
        });

        $.ajax({
            url: viewerUrl,
            type: 'GET',
            contentType: 'text/html',
        }).done((response) => {
            const $appContent = $('#app-content');

            const doneCallback = () => {
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
            initalizeDicomViewer(fileDownloadUrl, doneCallback);
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

    openViewerMain(getMetadataCallback) {
        const self = this;
        const url = OC.generateUrl("/apps/dicomviewer/viewerMain");
        const hide = () => {
            $('#viewerMain').remove();
            $('#app-content-files').css({ display: 'block' });
            self.isViewerMainShown = false;
        };

        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'text/html',
        }).done((response) => {
            const $appContent = $('#content');

            const doneCallback = () => {
                $('.js-close-viewer').click(() => {
                    hide();
                });
            };

            // Go back on ESC
            $(document).keyup((e) => {
                if (self.isViewerMainShown && e.keyCode === 27) {
                    hide();
                }
            });

            $('#app-content-files').css({ display: 'none' });

            $appContent.append(response);

            self.isViewerMainShown = true;

            initializeViewerMain(getMetadataCallback, doneCallback);
        });

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
            displayName: 'Open with DICOM Viewer',
            mime: 'all',
            permissions: OC.PERMISSION_READ,
            order: -10000,
            templateName: 'viewer',
            iconClass: 'icon-dicomviewer-dark',
            actionHandler: (fileName, context) => {
                const isDCMFile = (/\.(dcm)$/i).test(fileName);
                if (isDCMFile) {
                    const fileDownloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
                    if (fileDownloadUrl && fileDownloadUrl !== '#') {
                        self.show(fileDownloadUrl, true);
                    }
                } else {
                    const getMetadata = (metadataCompleted) => {
                        const promise = context.fileList.filesClient.getFolderContents(fileName);
                        promise.then((status, files) => {
                            const dicomFiles = files.filter(file => file.mimetype === 'application/dicom');

                            if (!dicomFiles || !dicomFiles.length) {
                                return;
                            }

                            const viewerData = {
                                studies: []
                            };

                            console.time('performance');

                            // Create study metadata in json
                            const promises = [];
                            const imagesData = [];

                            dicomFiles.forEach((file) => {
                                const fileUrl = context.fileList.getDownloadUrl(file.name, file.path);
                                const fullUrl = generateFullUrl(fileUrl);
                                const wadouri = `wadouri:${fullUrl}`;
                                const isLoaded = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.isLoaded(fullUrl);
                                if (isLoaded) {
                                    const dataSet = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(fullUrl);
                                    imagesData.push({
                                        dataSet,
                                        wadouri
                                    });
                                    promises.push(Promise.resolve());
                                } else {
                                    promises.push(new Promise((resolve) => {
                                        const dataSetPromise = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.load(fullUrl);
                                        dataSetPromise.then((dataSet) => {
                                            imagesData.push({
                                                dataSet,
                                                wadouri
                                            });
                                            resolve();
                                        });
                                    }));
                                }
                            });

                            Promise.all(promises).then(() => {
                                imagesData.forEach((imageData) => {
                                    createMetadataJSON(imageData.wadouri, imageData.dataSet, viewerData.studies);
                                });

                                console.timeEnd('performance');

                                metadataCompleted(viewerData);
                            });
                        });
                    };
                    self.openViewerMain(getMetadata);

                }
            }
        });

        // Add default action
        fileActions.setDefault(self.mimeType, 'view');
    }
}

export default DicomViewer;
