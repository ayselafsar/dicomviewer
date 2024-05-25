import { generateUrl } from '@nextcloud/router';
import isPublicPage from './utils/isPublicPage.js';
import isDicom from './utils/isDicom.js'
import getPublicShareToken from './utils/getPublicShareToken.js';
import getPublicFileName from './utils/getPublicFileName.js';

window.addEventListener('DOMContentLoaded', function() {
    if (!isPublicPage() || !isDicom()) {
        return;
    }

    // Support displaying single DICOM file on public
    const previewElmt = document.getElementById('preview');
    if (previewElmt) {
        const shareToken = getPublicShareToken();
        const fileName = getPublicFileName();
        const dicomUrl = shareToken && window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/publicdicomjson?file=${shareToken}|${fileName}`);
        const viewerUrl = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);

        const div = document.createElement('div');
        div.style.marginTop = '10px';
        div.innerHTML = `<a href="${viewerUrl}" id="openDicomFile" class="button" target="_blank"><span class="icon icon-toggle"></span>${' ' + t('dicomviewer', 'View') + ' '}</a>`;
        previewElmt.appendChild(div);
    }
});
