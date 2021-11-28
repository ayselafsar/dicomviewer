/* eslint import/no-extraneous-dependencies:0 */

import Handlebars from 'handlebars';

// AnnotationDialogs.html
Handlebars.registerHelper('EnterAnnotationText', t('dicomviewer', 'Enter your annotation'));
Handlebars.registerHelper('NewLabelText', t('dicomviewer', 'New label'));
Handlebars.registerHelper('EditAnnotationText', t('dicomviewer', 'Edit your annotation'));
Handlebars.registerHelper('OKText', t('dicomviewer', 'OK'));
Handlebars.registerHelper('RemoveMarkerText', t('dicomviewer', 'Remove Marker'));

// CaptureImageDialog.html
Handlebars.registerHelper('CaptureImageTitleText', t('dicomviewer', 'Capture High Quality Image'));
Handlebars.registerHelper('CaptureImageDescText', t('dicomviewer', 'Please specify the dimensions, and desired type for the output image.'));
Handlebars.registerHelper('WidthText', t('dicomviewer', 'Width (px)'));
Handlebars.registerHelper('HeightText', t('dicomviewer', 'Height (px)'));
Handlebars.registerHelper('FileNameText', t('dicomviewer', 'File Name'));
Handlebars.registerHelper('FileTypeText', t('dicomviewer', 'File Type'));
Handlebars.registerHelper('ShowAnnotationsText', t('dicomviewer', 'Show Annotations'));
Handlebars.registerHelper('ImageQualityText', t('dicomviewer', 'Image Quality (%)'));
Handlebars.registerHelper('ImagePreviewText', t('dicomviewer', 'Image Preview'));
Handlebars.registerHelper('CloseText', t('dicomviewer', 'Close'));
Handlebars.registerHelper('DownloadText', t('dicomviewer', 'Download'));

// Toolbar.html
Handlebars.registerHelper('ToggleSeriesPanelText', t('dicomviewer', 'Toggle Series Panel'));
Handlebars.registerHelper('SeriesText', t('dicomviewer', 'Series'));
Handlebars.registerHelper('MoreText', t('dicomviewer', 'More'));
Handlebars.registerHelper('CloseViewerText', t('dicomviewer', 'Close Viewer'));

// ViewerMain.html
Handlebars.registerHelper('LoadingText', t('dicomviewer', 'Loading…'));

// ViewportOverlay.html
Handlebars.registerHelper('SerText', t('dicomviewer', 'Ser:'));
Handlebars.registerHelper('ImgText', t('dicomviewer', 'Img:'));
