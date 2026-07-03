import { generateUrl } from '@nextcloud/router';
import isPublicPage from './utils/isPublicPage.js';
import isDicom from './utils/isDicom.js'
import getPublicShareToken from './utils/getPublicShareToken.js';
import getPublicFileName from './utils/getPublicFileName.js';

window.addEventListener('DOMContentLoaded', function() {
    if (!isPublicPage() || !isDicom()) {
        return;
    }

    // Support displaying single DICOM file on public share pages.
    // Route through /apps/dicomviewer/s/{token} so that password-protected
    // shares re-validate via PublicDisplayController when the session has
    // expired.  After (re-)authentication the controller redirects to the
    // actual DICOM viewer.
    const previewElmt = document.getElementById('preview');
    if (previewElmt) {
        const shareToken = getPublicShareToken();
        const fileName = getPublicFileName();

        if (shareToken) {
            const viewerUrl = generateUrl(`/apps/dicomviewer/s/${shareToken}?path=${encodeURIComponent(fileName || '')}`);

            const div = document.createElement('div');
            div.style.marginTop = '10px';
            div.innerHTML = `<a href="${viewerUrl}" id="openDicomFile" class="button" target="_blank"><span class="icon icon-toggle"></span>${' ' + t('dicomviewer', 'View') + ' '}</a>`;
            previewElmt.appendChild(div);
        }
    }
});
