import DICOMView from './views/DICOMView.vue';
import registerFileActions from './utils/registerFileActions.js';

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
