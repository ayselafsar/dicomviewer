import $ from 'jquery';
import { DCMViewer } from '../../../lib/viewerMain';
import initializeViewerMain from '../initializeViewerMain';
import configureCodecs from '../configureCodecs';
import ImageLoader from './ImageLoader';
import { DCMViewerError } from '../../../lib/DCMViewerError';
import AppDicomViewer from '../../templates/AppDicomViewer.html';

// Min device width to close series panel by default
const MIN_DEVICE_WIDTH = 992;

class DicomViewer {
    constructor() {
        this.mimeType = 'application/dicom';
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
        // Destroy the active image loader
        if (this.activeImageLoader) {
            this.activeImageLoader.destroy();
            this.activeImageLoader = null;
        }

        $('#AppDicomViewer').remove();
        $('#app-content-files').css({ display: 'block' });

        // Show footer on public template
        if ($('#isPublic').val()) {
            $('#content').removeClass('full-height');
            $('footer').removeClass('hidden');
            $('#app-content').removeClass('hidden');
        }

        this.isViewerMainShown = false;

        if (history && history.replaceState) {
            const stateData = {
                dir: FileList.getCurrentDirectory()
            };
            history.replaceState(stateData, '', '#');
        }

        FileList.setViewerMode(false);
    }

    /**
     * Show viewer
     * @param imageLoadPromise
     * @param seriesPanelOpen
     */
    show(imageLoadPromise, seriesPanelOpen = true) {
        // Hide footer on public template
        if ($('#isPublic').val()) {
            $('#content').addClass('full-height');
            $('footer').addClass('hidden');
            $('#app-content').addClass('hidden');
        }

        $('#app-content-files').css({ display: 'none' });

        // Close series panel on small screens
        const bodyWidth = $('body').width();
        const isSmallScreen = parseInt(bodyWidth, 10) < MIN_DEVICE_WIDTH;
        if (isSmallScreen && seriesPanelOpen) {
            seriesPanelOpen = false;
        }

        const $appContent = $('#content');
        $appContent.append(AppDicomViewer({ seriesPanelOpen }));

        // Go back on ESC
        $(document).keyup((e) => {
            if (this.isViewerMainShown && e.keyCode === 27) {
                this.hide();
            }
        });

        if (history && history.pushState) {
            history.pushState({}, '', '#dcmviewer');

            $(window).one('popstate', () => {
                this.hide();
            });
        }

        FileList.setViewerMode(true);

        this.isViewerMainShown = true;

        // Close viewer
        DCMViewer.ui.closeViewer = this.hide;

        imageLoadPromise.then((viewerData) => {
            initializeViewerMain(viewerData);
        }).catch(() => new DCMViewerError('Failed to load images'));
    }

    /**
     * Register file actions for dicom files
     * @param fileActions
     * @private
     */
    _registerFileActions(fileActions) {
        const self = this;

        // Register file actions for folders containing dicom files
        fileActions.registerAction({
            name: 'viewDicomFolder',
            displayName: window.t('dicomviewer', 'Open with DICOM Viewer'),
            mime: 'httpd/unix-directory',
            permissions: OC.PERMISSION_READ,
            order: -10000,
            templateName: 'AppDicomViewer',
            iconClass: 'icon-dicomviewer-dark',
            actionHandler: (fileName, context) => {
                // Destroy the active image loader if exists
                if (self.activeImageLoader) {
                    self.activeImageLoader.destroy();
                }

                self.activeImageLoader = new ImageLoader(context, fileName, self.mimeType, self.hide);

                const imageLoadPromise = self.activeImageLoader.loadMultipleDICOMInstances();
                self.show(imageLoadPromise);
            }
        });

        // Register file actions for single dicom files
        fileActions.registerAction({
            name: 'viewDicomFile',
            displayName: window.t('dicomviewer', 'Open with DICOM Viewer'),
            mime: this.mimeType,
            permissions: OC.PERMISSION_READ,
            templateName: 'AppDicomViewer',
            actionHandler: (fileName, context) => {
                // Destroy the active image loader if exists
                if (self.activeImageLoader) {
                    self.activeImageLoader.destroy();
                }

                self.activeImageLoader = new ImageLoader(context, fileName, self.mimeType, self.hide);

                const imageLoadPromise = self.activeImageLoader.loadSingleDICOMInstance();
                self.show(imageLoadPromise, false);
            }
        });

        // Add default action
        fileActions.setDefault(self.mimeType, 'viewDicomFile');
    }
}

export default DicomViewer;
