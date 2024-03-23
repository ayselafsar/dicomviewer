import DICOMView from './views/DICOMView.vue';
import generateFullUrl from './utils/generateFullUrl';
import registerFileActions from './utils/registerFileActions';
import './sidebar';

// Add MimeType Icon
OC.MimeType._mimeTypeIcons['application/dicom'] = `${generateFullUrl(OC.filePath('dicomviewer', 'img', 'app.svg'))}`;

OCA.Viewer.registerHandler({
    id: 'dicom',

    mimes: [
        'application/dicom',
        'application/dcm',
    ],

    component: DICOMView,

    canCompare: true,
});

registerFileActions();
