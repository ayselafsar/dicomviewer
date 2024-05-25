import { generateUrl } from '@nextcloud/router';
import DICOMView from './views/DICOMView.vue';
import generateFullUrl from './utils/generateFullUrl.js';
import registerFileActions from './utils/registerFileActions.js';
import './sidebar.js';

// Add MimeType Icon
OC.MimeType._mimeTypeIcons['application/dicom'] = `${generateFullUrl(generateUrl('/apps/dicomviewer/img/app.svg'))}`;

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
