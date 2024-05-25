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

        if (isPublic) {
            const shareToken = getPublicShareToken();
            dicomUrl = shareToken && window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/publicdicomjson?file=${shareToken}|${file.filename}`);
        } else {
            dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${file.ownerId}|${file.fileid}`);
        }

        // Open viewer in a new tab
        const tab = window.open('about:blank');
        tab.location = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
        tab.focus();

        // Close the loading modal
        this.$parent.close();
    },
}
</script>
