<template>
  <div></div>
</template>

<script>
import { generateUrl } from '@nextcloud/router'
import isPublicPage from '../utils/isPublicPage';
import getPublicShareToken from '../utils/getPublicShareToken';

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

    if (dicomUrl) {
      const tab = window.open('about:blank');
      tab.location = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
      tab.focus();
    }

    // Close the loading modal
    this.$parent.close();
  },
}
</script>
