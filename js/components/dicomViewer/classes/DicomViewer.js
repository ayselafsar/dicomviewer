import $ from 'jquery';
import {cornerstone, cornerstoneWADOImageLoader} from '../../../lib/cornerstonejs';
import { DCMViewer } from '../../../lib/components/viewerMain';
import generateFullUrl from '../../../lib/generateFullUrl';
import initalizeDicomViewer from '../initializeDicomViewer';
import initializeViewerMain from '../initializeViewerMain';
import configureCodecs from '../configureCodecs';
import updateMetadata from '../lib/updateMetadata';

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

    openViewerMain(viewerMainMetadataPromise) {
        const self = this;
        const url = OC.generateUrl("/apps/dicomviewer/viewerMain");
        const hide = () => {
            $('#viewerMain').remove();
            $('#app-content-files').css({ display: 'block' });
            self.isViewerMainShown = false;

            cornerstone.events.removeEventListener('cornerstoneimageloadprogress', self.imageLoadProgressHandler);
        };

        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'text/html',
        }).done((response) => {
            const $appContent = $('#content');

            // Go back on ESC
            $(document).keyup((e) => {
                if (self.isViewerMainShown && e.keyCode === 27) {
                    hide();
                }
            });

            $('#app-content-files').css({ display: 'none' });

            $appContent.append(response);

            self.isViewerMainShown = true;

            // Close viewer
            DCMViewer.ui.closeViewer = hide;

            initializeViewerMain(viewerMainMetadataPromise);
        });
    }

    imageLoadProgressHandler(event) {
        // Update load progress
        const eventData = event.detail;
        const $loadingPercentage = $('#loadingPercentage');
        $loadingPercentage.text(eventData.percentComplete);
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
                        cornerstone.events.addEventListener('cornerstoneimageloadprogress', self.imageLoadProgressHandler);

                        const promise = new Promise((resolve) => {
                            const viewerData = {
                                studies: []
                            };

                            const fullUrl = generateFullUrl(fileDownloadUrl);
                            const wadouri = `wadouri:${fullUrl}`;

                            const isLoaded = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.isLoaded(fullUrl);

                            if (isLoaded) {
                                const dataSet = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(fullUrl);
                                updateMetadata(wadouri, dataSet, viewerData.studies);

                                resolve(viewerData);
                            } else {
                                const dataSetPromise = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.load(fullUrl);
                                dataSetPromise.then((dataSet) => {
                                    updateMetadata(wadouri, dataSet, viewerData.studies);

                                    resolve(viewerData);
                                });
                            }
                        });

                        self.openViewerMain(promise);
                    }
                } else {
                    let allDicomFiles = [];
                    const allDicomPromises = [];

                    const getDicomFiles = (files) => {
                        const folderMimeType = 'httpd/unix-directory';
                        const dicomFiles = files.filter(file => file.mimetype === self.mimeType);
                        const folders = files.filter(file => file.mimetype === folderMimeType);

                        allDicomFiles = allDicomFiles.concat(dicomFiles);

                        folders.forEach(folder => {
                            const folderPath = `${folder.path}/${folder.name}`;
                            const promise = new Promise((resolve) => {
                                const filePromise = context.fileList.filesClient.getFolderContents(folderPath);

                                filePromise.then((status, files) => {
                                    getDicomFiles(files);

                                    resolve();
                                });

                            });

                            allDicomPromises.push(promise);
                        });
                    };

                    const viewerMainMetadataPromise = new Promise((viewerMainMetadataResolve) => {
                        const folderPath = `${context.dir}/${fileName}`;
                        const promise = context.fileList.filesClient.getFolderContents(folderPath);
                        promise.then((status, files) => {
                            getDicomFiles(files);

                            Promise.all(allDicomPromises).then(() => {
                                if (!allDicomFiles || !allDicomFiles.length) {
                                    setTimeout(() => {
                                        $('.loadingViewerMain').text('No DICOM File Found');
                                    }, 500);
                                    return;
                                }

                                let loadedFileCount = 0;
                                const updateLoadingPercentage = () => {
                                    loadedFileCount += 1;
                                    const percentage = Math.floor(loadedFileCount / allDicomFiles.length * 100);
                                    const $loadingPercentage = $('#loadingPercentage');
                                    $loadingPercentage.text(percentage);
                                };

                                console.time('performance');

                                // Create study metadata in json
                                const promises = [];
                                const imagesData = [];

                                allDicomFiles.forEach((file) => {
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

                                        // Update loading percentage
                                        updateLoadingPercentage();

                                        promises.push(Promise.resolve());
                                    } else {
                                        promises.push(new Promise((resolve) => {
                                            const dataSetPromise = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.load(fullUrl);
                                            dataSetPromise.then((dataSet) => {
                                                imagesData.push({
                                                    dataSet,
                                                    wadouri
                                                });

                                                // Update loading percentage
                                                updateLoadingPercentage();

                                                resolve();
                                            });
                                        }));
                                    }
                                });

                                Promise.all(promises).then(() => {
                                    const viewerData = {
                                        studies: []
                                    };

                                    imagesData.forEach((imageData) => {
                                        updateMetadata(imageData.wadouri, imageData.dataSet, viewerData.studies);
                                    });

                                    // Sort series
                                    viewerData.studies.forEach(study => {
                                        study.seriesList.sort((a, b) => {
                                            return parseInt(a.seriesNumber) - parseInt(b.seriesNumber);
                                        });
                                    });

                                    console.timeEnd('performance');

                                    viewerMainMetadataResolve(viewerData);
                                });
                            });
                        });
                    });

                    self.openViewerMain(viewerMainMetadataPromise);

                }
            }
        });

        // Add default action
        fileActions.setDefault(self.mimeType, 'view');
    }
}

export default DicomViewer;
