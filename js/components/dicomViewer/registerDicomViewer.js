import DicomViewer from './classes/DicomViewer';

// Add MimeType Icon
OC.MimeType._mimeTypeIcons['application/dicom'] = '/apps/dicomviewer/img/app-dark.svg';

// Register DICOM Viewer
OC.Plugins.register('OCA.Files.FileList', new DicomViewer());
