<template>
	<div />
</template>

<script>
import { generateUrl } from '@nextcloud/router'
import isPublicPage from '../utils/isPublicPage.js';
import getPublicShareToken from '../utils/getPublicShareToken.js';

export default {
    name: 'DICOMView',

    async mounted() {
        let dicomUrl;

        const file = this.fileList.find((file) => file.fileid === this.fileid);
        const isPublic = isPublicPage();

        let viewerUrl;
        if (isPublic) {
            // Route through PublicDisplayController so password-protected shares
            // trigger the Nextcloud auth form when the session has expired.
            const shareToken = getPublicShareToken();
            viewerUrl = shareToken
                ? generateUrl(`/apps/dicomviewer/s/${shareToken}?path=${encodeURIComponent(file.filename || '')}`)
                : null;
        } else {
            dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${file.ownerId}|${file.fileid}`);
            viewerUrl = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
        }

        // Open viewer in a new tab
        const tab = window.open('about:blank');
        tab.location = viewerUrl;
        tab.focus();

        // Close the loading modal
        this.$parent.close();
    },
}
</script>
