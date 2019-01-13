import $ from 'jquery';
import { cornerstone, cornerstoneWADOImageLoader } from '../../../lib/cornerstonejs';
import generateFullUrl from '../../../lib/generateFullUrl';
import createMetadata from '../lib/createMetadata';

class ImageLoader {
    constructor(context, fileName, mimeType, hide) {
        this.context = context;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.hide = hide;
        this.destroyed = false;
    }

    destroy() {
        this.destroyed = true;

        // Stop listening to update loading progress
        cornerstone.events.removeEventListener('cornerstoneimageloadprogress', this.imageLoadProgressHandler);
    }

    handleError(error) {
        // Skip if it is canceled/destroyed
        if (!error) {
            return;
        }

        console.error('Failed to load image', error);
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
     * Show warning if there is no available dicom file
     */
    noAvailableDicomFileWarning() {
        const self = this;

        setTimeout(() => {
            const $loadingViewerMain = $('.loadingViewerMain');

            // Clear previous text
            $loadingViewerMain.text('');

            // Create Close button to hide loading view
            const icon = document.createElement('i');
            icon.className = 'fa fa-times fa-lg';

            const link = document.createElement('a');
            link.className = 'button-close js-close-viewer';

            $(link).append(icon);
            $loadingViewerMain.append(link);
            $(link).click(() => {
                self.hide();
            });

            const content = '<p style="text-align: center;">' +
                `${t('dicomviewer', 'There is no available DICOM image to display')}` +
                '</p>';
            $loadingViewerMain.append(content);
        }, 500);
    }

    /**
     * Load single DICOM instance
     */
    loadSingleDICOMInstance() {
        const self = this;
        const { context, fileName } = this;
        const fileDownloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
        if (!fileDownloadUrl || fileDownloadUrl === '#') {
            return;
        }

        // Listen to update loading progress
        cornerstone.events.addEventListener('cornerstoneimageloadprogress', this.imageLoadProgressHandler);

        return new Promise((resolve, reject) => {
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
                    // Reject if it is canceled/destroyed
                    if (self.destroyed) {
                        reject();
                        return;
                    }

                    createMetadata(wadouri, dataSet, viewerData.studies);
                    resolve(viewerData);
                }).catch(self.handleError);
            }
        });
    }

    /**
     * Get all files and folders in the given folder path
     * @param folderPath
     */
    async getFolderContents(folderPath) {
        const self = this;
        const { context } = this;

        return new Promise((resolve, reject) => {
            const filePromise = context.fileList.filesClient.getFolderContents(folderPath);
            filePromise.then((status, files) => {
                // Reject if it is canceled/destroyed
                if (self.destroyed) {
                    reject();
                    return;
                }

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
        const noExtension = 'application/octet-stream';

        return new Promise((resolve, reject) => {
            let allDicomFiles = files.filter(file => file.mimetype === self.mimeType || file.mimetype === noExtension);

            const folderMimeType = 'httpd/unix-directory';
            const folders = files.filter(file => file.mimetype === folderMimeType);

            const filePromises = [];

            for (let i = 0; i < folders.length; i++) {
                // Reject if it is canceled/destroyed
                if (self.destroyed) {
                    reject();
                    return;
                }

                const folder = folders[i];
                const folderPath = `${folder.path}/${folder.name}`;

                const filePromise = new Promise((fileResolve, fileReject) => {
                    const folderPromise = self.getFolderContents(folderPath);
                    folderPromise.then((subFiles) => {
                        // Reject if it is canceled/destroyed
                        if (self.destroyed) {
                            fileReject();
                            return;
                        }

                        const subDicomFilesPromise = self.getAllDicomFiles(subFiles);
                        subDicomFilesPromise.then((subDicomFiles) => {
                            // Reject if it is canceled/destroyed
                            if (self.destroyed) {
                                fileReject();
                                return;
                            }

                            fileResolve(subDicomFiles);
                        }).catch(self.handleError);
                    }).catch(self.handleError);
                });
                filePromises.push(filePromise);
            }

            if (filePromises.length < 1) {
                resolve(allDicomFiles);
            } else {
                // Wait for all files to read in parallel
                Promise.all(filePromises).then((subDicomFiles) => {
                    // Reject if it is canceled/destroyed
                    if (self.destroyed) {
                        reject();
                        return;
                    }

                    allDicomFiles = allDicomFiles.concat(...subDicomFiles);
                    resolve(allDicomFiles);
                }).catch(self.handleError);
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
        const self = this;

        return new Promise((resolve, reject) => {
            this.readAllDicomFiles().then((allDicomFiles) => {
                // Reject if it is canceled/destroyed
                if (self.destroyed) {
                    reject();
                    return;
                }

                // Warn if no DICOM file is available
                if (!allDicomFiles || !allDicomFiles.length) {
                    self.noAvailableDicomFileWarning();
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
                    // Reject if it is canceled/destroyed
                    if (self.destroyed) {
                        reject();
                        return;
                    }

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
                        const imagePromise = new Promise((imageResolve, imageReject) => {
                            const dataSetPromise = dataSetCacheManager.load(fullUrl);
                            dataSetPromise.then((dataSet) => {
                                // Reject if it is canceled/destroyed
                                if (self.destroyed) {
                                    imageReject();
                                    return;
                                }

                                imagesData.push({
                                    dataSet,
                                    wadouri
                                });

                                updateLoadingPercentage();

                                imageResolve();
                            }).catch(() => imageReject());
                        });

                        // Resolve when image is loaded
                        allImagePromises.push(imagePromise);
                    }
                }

                // Handle when all images are loaded
                Promise.all(Array.from(allImagePromises.map(p => p.catch(() => null)))).then(() => {
                    // Reject if it is canceled/destroyed
                    if (self.destroyed) {
                        reject();
                        return;
                    }

                    // Stop if there is no available image data
                    if (!imagesData.length) {
                        self.noAvailableDicomFileWarning();
                        return;
                    }

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
                }).catch(self.handleError);
            }).catch(self.handleError);
        });
    }
}

export default ImageLoader;
