import $ from 'jquery';
import { cornerstone, cornerstoneWADOImageLoader } from '../../../lib/cornerstonejs';
import { DCMViewer } from '../../../lib/components/viewerMain';
import generateFullUrl from '../../../lib/generateFullUrl';
import initializeViewerMain from '../initializeViewerMain';
import configureCodecs from '../configureCodecs';
import updateMetadata from '../lib/updateMetadata';

class DicomViewer {
    constructor() {
        this.mimeType = 'application/dicom';
        this.context = undefined;
        this.isViewerMainShown = false;
        this.allDicomFiles = [];
        this.allDicomFilesPromises = [];
        this.allDicomPromises = [];
        this.cancelAllPromises = false;

        configureCodecs();
    }

    /**
     * Initialize DICOMViewerPlugin actions
     * @param fileList
     */
    attach(fileList) {
        this._registerFileActions(fileList.fileActions);
    }

    hide() {
        $('#viewerMain').remove();
        $('#app-content-files').css({ display: 'block' });

        this.isViewerMainShown = false;
        this.cancelAllPromises = true;

        FileList.setViewerMode(false);

        // Stop cornerstone loading progress
        cornerstone.events.removeEventListener('cornerstoneimageloadprogress', this.imageLoadProgressHandler);
    }

    /**
     * Show viewer
     * @param viewerMainMetadataPromise
     * @param isSingleDICOMFile
     */
    show(viewerMainMetadataPromise, isSingleDICOMFile) {
        const self = this;
        const url = OC.generateUrl('/apps/dicomviewer/viewerMain');

        $.ajax({
            url,
            type: 'GET',
            contentType: 'text/html',
            data: {
                isSingleDICOMFile
            }
        }).done((response) => {
            const $appContent = $('#content');

            // Go back on ESC
            $(document).keyup((e) => {
                if (self.isViewerMainShown && e.keyCode === 27) {
                    self.hide();
                }
            });

            $('#app-content-files').css({ display: 'none' });
            $appContent.append(response);

            if (!$('html').hasClass('ie8')) {
                history.pushState({}, '', '#dcmviewer');
            }

            if (!$('html').hasClass('ie8')) {
                $(window).one('popstate', () => {
                    self.hide();
                });
            }

            self.isViewerMainShown = true;

            // Close viewer
            DCMViewer.ui.closeViewer = self.hide;

            initializeViewerMain(viewerMainMetadataPromise);
        });
    }

    /**
     * Get all DICOM files in all levels of the folder
     * @param files
     */
    getDicomFiles(availableFiles) {
        const self = this;
        const folderMimeType = 'httpd/unix-directory';
        const dicomFiles = availableFiles.filter(file => file.mimetype === self.mimeType);
        const folders = availableFiles.filter(file => file.mimetype === folderMimeType);

        this.allDicomFiles = this.allDicomFiles.concat(dicomFiles);

        folders.forEach((folder) => {
            const folderPath = `${folder.path}/${folder.name}`;
            const promise = new Promise((resolve) => {
                const filePromise = self.context.fileList.filesClient.getFolderContents(folderPath);

                filePromise.then((status, files) => {
                    self.getDicomFiles(files);

                    resolve();
                });
            });

            self.allDicomFilesPromises.push(promise);
        });
    }

    /**
     * Update loading percentage of single DICOM instance
     * @param event
     */
    imageLoadProgressHandler(event) {
        // Update load progress
        const eventData = event.detail;
        const $loadingPercentage = $('#loadingPercentage');
        $loadingPercentage.text(eventData.percentComplete);
    }

    loadSingleDICOMInstance() {
        const self = this;
        const { context } = self;
        const { fileName } = self;

        const fileDownloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
        if (fileDownloadUrl && fileDownloadUrl !== '#') {
            cornerstone.events.addEventListener('cornerstoneimageloadprogress', self.imageLoadProgressHandler);

            const promise = new Promise((resolve) => {
                const { dataSetCacheManager } = cornerstoneWADOImageLoader.wadouri;
                const viewerData = {
                    studies: []
                };

                const fullUrl = generateFullUrl(fileDownloadUrl);
                const wadouri = `wadouri:${fullUrl}`;

                const isLoaded = dataSetCacheManager.isLoaded(fullUrl);

                if (isLoaded) {
                    const dataSet = dataSetCacheManager.get(fullUrl);
                    updateMetadata(wadouri, dataSet, viewerData.studies);

                    resolve(viewerData);
                } else {
                    const dataSetPromise = dataSetCacheManager.load(fullUrl);
                    dataSetPromise.then((dataSet) => {
                        updateMetadata(wadouri, dataSet, viewerData.studies);

                        resolve(viewerData);
                    });
                }
            });

            self.show(promise, true);
        }
    }

    loadMultipleDICOMInstances() {
        const self = this;
        const { context } = self;
        const { fileName } = self;
        self.allDicomFiles = [];
        self.allDicomFilesPromises = [];

        const viewerMainMetadataPromise = new Promise((viewerMainMetadataResolve) => {
            const folderPath = `${context.dir}/${fileName}`;
            const promise = context.fileList.filesClient.getFolderContents(folderPath);

            promise.then((status, files) => {
                // Get all ficom files
                self.getDicomFiles(files);

                Promise.all(self.allDicomFilesPromises).then(() => {
                    // If no DICOM file is available
                    if (!self.allDicomFiles || !self.allDicomFiles.length) {
                        setTimeout(() => {
                            $('.loadingViewerMain').text('No DICOM File Found');
                        }, 500);
                        return;
                    }

                    let loadedFileCount = 0;

                    const updateLoadingPercentage = () => {
                        loadedFileCount += 1;
                        const percentage = Math.floor((loadedFileCount / self.allDicomFiles.length) * 100);
                        const $loadingPercentage = $('#loadingPercentage');
                        $loadingPercentage.text(percentage);
                    };

                    console.time('performance');

                    // Create study metadata in json
                    self.allDicomPromises = [];
                    const imagesData = [];

                    self.allDicomFiles.forEach((file) => {
                        const fileUrl = context.fileList.getDownloadUrl(file.name, file.path);
                        const fullUrl = generateFullUrl(fileUrl);
                        const wadouri = `wadouri:${fullUrl}`;
                        const { dataSetCacheManager } = cornerstoneWADOImageLoader.wadouri;
                        const isLoaded = dataSetCacheManager.isLoaded(fullUrl);

                        if (isLoaded) {
                            const dataSet = dataSetCacheManager.get(fullUrl);

                            // Add instance information
                            imagesData.push({
                                dataSet,
                                wadouri
                            });

                            // Update loading percentage
                            updateLoadingPercentage();

                            self.allDicomPromises.push(Promise.resolve());
                        } else {
                            self.allDicomPromises.push(new Promise((resolve) => {
                                const dataSetPromise = dataSetCacheManager.load(fullUrl);
                                dataSetPromise.then((dataSet) => {
                                    if (self.cancelAllPromises) {
                                        throw Error('Loading canceled');
                                    }

                                    // Add instance inxformation
                                    imagesData.push({
                                        dataSet,
                                        wadouri
                                    });

                                    // Update loading percentage
                                    updateLoadingPercentage();

                                    resolve();
                                }).catch((err) => {
                                    console.log('ERROR ', err);
                                });
                            }));
                        }
                    });

                    Promise.all(self.allDicomPromises).then(() => {
                        const viewerData = {
                            studies: []
                        };

                        imagesData.forEach((imageData) => {
                            updateMetadata(imageData.wadouri, imageData.dataSet, viewerData.studies);
                        });

                        // Sort series
                        viewerData.studies.forEach((study) => {
                            study.seriesList.sort((a, b) => parseInt(a.seriesNumber, 10) - parseInt(b.seriesNumber, 10));
                        });

                        console.timeEnd('performance');

                        viewerMainMetadataResolve(viewerData);
                    });
                });
            });
        });

        self.show(viewerMainMetadataPromise);
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
            templateName: 'viewerMain',
            iconClass: 'icon-dicomviewer-dark',
            actionHandler: (fileName, context) => {
                self.context = context;
                self.fileName = fileName;
                self.cancelAllPromises = false;

                const isDCMFile = (/\.(dcm)$/i).test(fileName);
                if (isDCMFile) {
                    self.loadSingleDICOMInstance();
                } else {
                    self.loadMultipleDICOMInstances();
                }
            }
        });

        // Add default action
        fileActions.setDefault(self.mimeType, 'view');
    }
}

export default DicomViewer;
