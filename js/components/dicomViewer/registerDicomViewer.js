import DicomViewer from './classes/DicomViewer';
import generateFullUrl from '../../lib/generateFullUrl';

// Add MimeType Icon
OC.MimeType._mimeTypeIcons['application/dicom'] = `${generateFullUrl(OC.filePath('dicomviewer', 'img', 'app-dark.svg'))}`;

// Register DICOM Viewer
OC.Plugins.register('OCA.Files.FileList', new DicomViewer());
