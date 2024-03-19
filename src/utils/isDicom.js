const mimetypeElmt = document.getElementById('mimetype')
export default () => mimetypeElmt && (mimetypeElmt.value === 'application/dicom' || mimetypeElmt.value === 'application/dcm')
