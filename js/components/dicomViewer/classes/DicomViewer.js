import $ from 'jquery';
import { cornerstone, cornerstoneWADOImageLoader } from '../../../lib/cornerstonejs';
import { DCMViewer } from '../../../lib/components/viewerMain';
import generateFullUrl from '../../../lib/generateFullUrl';
import initializeViewerMain from '../initializeViewerMain';
import configureCodecs from '../configureCodecs';
import createMetadata from '../lib/createMetadata';

class DicomViewer {
    constructor() {
        this.mimeType = 'application/dicom';
        this.context = undefined;
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
     * Hide viewer
     */
    hide() {
        $('#viewerMain').remove();
        $('#app-content-files').css({ display: 'block' });

        this.isViewerMainShown = false;
        this.cancelled = true;

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
     * Update loading percentage of single DICOM instance
     * @param event
     */
    imageLoadProgressHandler(event) {
        // Update load progress
        const eventData = event.detail;
        const $loadingPercentage = $('#loadingPercentage');
        $loadingPercentage.text(eventData.percentComplete);
    }

    /**
     * Load single DICOM instance
     */
    async loadSingleDICOMInstance() {
        const { context, fileName } = this;
        const fileDownloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
        if (!fileDownloadUrl || fileDownloadUrl === '#') {
            return;
        }

        // Listen to update loading progress
        cornerstone.events.addEventListener('cornerstoneimageloadprogress', this.imageLoadProgressHandler);

        return new Promise((resolve) => {
            const { dataSetCacheManager } = cornerstoneWADOImageLoader.wadouri;
            const viewerData = {
                studies: []
            };

            const fullUrl = generateFullUrl(fileDownloadUrl);
            const wadouri = `wadouri:${fullUrl}`;

            const isLoaded = dataSetCacheManager.isLoaded(fullUrl);
            if (isLoaded) {
                const dataSet = dataSetCacheManager.get(fullUrl);
                createMetadata(wadouri, dataSet, viewerData.studies);
                resolve(viewerData);
            } else {
                const dataSetPromise = dataSetCacheManager.load(fullUrl);
                dataSetPromise.then((dataSet) => {
                    createMetadata(wadouri, dataSet, viewerData.studies);
                    resolve(viewerData);
                });
            }
        });
    }

    /**
     * Get all files and folders in the given folder path
     * @param folderPath
     */
    async getFolderContents(folderPath) {
        const { context } = this;

        return new Promise((resolve) => {
            const filePromise = context.fileList.filesClient.getFolderContents(folderPath);
            filePromise.then((status, files) => {
                resolve(files);
            });
        });
    }

    /**
     * Get all DICOM files in all levels of the folder in parallel
     * @param files
     */
    getAllDicomFiles(files) {
        const self = this;

        return new Promise((resolve) => {
            let allDicomFiles = files.filter(file => file.mimetype === this.mimeType);

            const folderMimeType = 'httpd/unix-directory';
            const folders = files.filter(file => file.mimetype === folderMimeType);

            const filePromises = [];

            for (let i = 0; i < folders.length; i++) {
                const folder = folders[i];
                const folderPath = `${folder.path}/${folder.name}`;

                const filePromise = new Promise((fileResolve) => {
                    const folderPromise = self.getFolderContents(folderPath);
                    folderPromise.then((subFiles) => {
                        const subDicomFilesPromise = self.getAllDicomFiles(subFiles);
                        subDicomFilesPromise.then((subDicomFiles) => {
                            fileResolve(subDicomFiles);
                        });
                    });
                });
                filePromises.push(filePromise);
            }

            if (filePromises.length < 1) {
                resolve(allDicomFiles);
            } else {
                // Wait for all files to read in parallel
                Promise.all(filePromises).then((subDicomFiles) => {
                    allDicomFiles = allDicomFiles.concat(...subDicomFiles);
                    resolve(allDicomFiles);
                });
            }
        });
    }

    /**
     * Read all DICOM files and wait for all to be read
     */
    async readAllDicomFiles() {
        const folderPath = `${this.context.dir}/${this.fileName}`;
        const files = await this.getFolderContents(folderPath);
        const allDicomFiles = await this.getAllDicomFiles(files);
        return allDicomFiles;
    }

    /**
     * Load multiple instances
     */
    loadMultipleDICOMInstances() {
        const { context } = this;

        return new Promise((resolve) => {
            this.readAllDicomFiles().then((allDicomFiles) => {
                // Warn if no DICOM file is available
                if (!allDicomFiles || !allDicomFiles.length) {
                    setTimeout(() => {
                        $('.loadingViewerMain').text('No DICOM File Found');
                    }, 500);
                    return;
                }

                const allImagePromises = [];
                const imagesData = [];
                let loadedImageCount = 0;

                const updateLoadingPercentage = () => {
                    loadedImageCount += 1;
                    const percentage = Math.floor((loadedImageCount / allDicomFiles.length) * 100);
                    const $loadingPercentage = $('#loadingPercentage');
                    $loadingPercentage.text(percentage);
                };

                for (let i = 0; i < allDicomFiles.length; i++) {
                    const file = allDicomFiles[i];
                    const fileUrl = context.fileList.getDownloadUrl(file.name, file.path);
                    const fullUrl = generateFullUrl(fileUrl);
                    const wadouri = `wadouri:${fullUrl}`;

                    const { dataSetCacheManager } = cornerstoneWADOImageLoader.wadouri;
                    const isLoaded = dataSetCacheManager.isLoaded(fullUrl);

                    if (isLoaded) {
                        const dataSet = dataSetCacheManager.get(fullUrl);
                        imagesData.push({
                            dataSet,
                            wadouri
                        });

                        updateLoadingPercentage();

                        // Resolve immediately because it is in cache
                        allImagePromises.push(Promise.resolve());
                    } else {
                        const imagePromise = new Promise((imageResolve) => {
                            const dataSetPromise = dataSetCacheManager.load(fullUrl);
                            dataSetPromise.then((dataSet) => {
                                imagesData.push({
                                    dataSet,
                                    wadouri
                                });

                                updateLoadingPercentage();

                                imageResolve();
                            });
                        });

                        // Resolve when image is loaded
                        allImagePromises.push(imagePromise);
                    }
                }

                // Handle when all images are loaded
                Promise.all(allImagePromises).then(() => {
                    const viewerData = {
                        studies: []
                    };

                    // Create metadata and set into viewerData
                    imagesData.forEach((imageData) => {
                        createMetadata(imageData.wadouri, imageData.dataSet, viewerData.studies);
                    });

                    // Sort series in viewerData
                    viewerData.studies.forEach((study) => {
                        study.seriesList.sort((a, b) => parseInt(a.seriesNumber, 10) - parseInt(b.seriesNumber, 10));
                    });

                    // Resolve when all images are loaded and ready to display
                    resolve(viewerData);
                });
            });
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
            templateName: 'viewerMain',
            iconClass: 'icon-dicomviewer-dark',
            actionHandler: (fileName, context) => {
                self.context = context;
                self.fileName = fileName;

                const isDCMFile = (/\.(dcm)$/i).test(fileName);
                if (isDCMFile) {
                    const promise = self.loadSingleDICOMInstance();
                    self.show(promise, true);
                } else {
                    const promise = self.loadMultipleDICOMInstances();
                    self.show(promise);
                }
            }
        });

        // Add default action
        fileActions.setDefault(self.mimeType, 'view');
    }
}

export default DicomViewer;
