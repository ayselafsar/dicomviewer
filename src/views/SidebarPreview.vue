<template>
  <div :class="{ 'icon-loading': loading }">
    <div v-if="error">
      {{ error }}
    </div>
    <template v-else>
      <div :style="{ display: 'flex', justifyContent: 'center' }">
        <div :style="{ width: '256px', height: '256px' }" ref="thumbnailElement" />
      </div>
      <div>
        <h3>{{ t('dicomviewer', 'DICOM Attributes') }}</h3>
        <div>
          <input
              :style="{ width: '100%', marginBottom: '10px' }"
              :placeholder="t('dicomviewer', 'Search for attributes…')"
              v-model="attributeSearchText"
          >
        </div>
        <table :style="{ width: '100%', tableLayout: 'fixed' }">
          <tr>
            <th>{{ t('dicomviewer', 'Attribute') }}</th>
            <th>{{ t('dicomviewer', 'Value') }}</th>
          </tr>
          <tr :style="{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 'smaller' }"
              v-for="attribute in attributes"
              :key="attribute.tagName"
          >
            <td :style="{ padding: '5px 0 5px 0' }">
              <p>{{ attribute.tagName }}</p>
              <p>{{ attribute.tagValue }}</p>
            </td>
            <td :style="{ padding: '5px 0 5px 0' }" v-html="attribute.text"></td>
          </tr>
        </table>
      </div>
      <div
          :style="{ textAlign: 'center', padding: '20px' }"
          v-if="attributes.length === 0 && !loading"
      >
        {{ t('dicomviewer', 'No DICOM attribute found') }}
      </div>
    </template>
  </div>
</template>

<script>
import _ from 'underscore';
import { cornerstone, cornerstoneWADOImageLoader } from '../utils/cornerstonejs';
import getDICOMAttributes from '../utils/dicom/getDICOMAttributes';

export default {
  name: 'SidebarPreview',
  data() {
    return {
      error: '',
      loading: true,
      fileInfo: null,
      cachedAllAttributes: [],
      attributes: [],
      attributeSearchText: '',
    };
  },
  created() {
    this.debouncedSearch = _.debounce(this.search, 500);
  },
  mounted() {
    this.thumbnailElement = this.$refs.thumbnailElement;
    this.renderThumbnailElement();
  },
  watch: {
    attributeSearchText() {
      this.debouncedSearch();
    },
  },
  methods: {
    async update(fileInfo) {
      this.fileInfo = fileInfo;
      this.resetState();
      await this.getAttributes();
    },
    resetState() {
      this.loading = true;
      this.error = '';
      this.cachedAllAttributes = [];
      this.attributes = [];
      this.attributeSearchText = '';

      this.clearRenderThumbnailInterval();

      if (this.thumbnailElement) {
        cornerstone.disable(this.thumbnailElement);
      }
    },
    async getAttributes() {
      try {
        this.loading = true;

        const fullUrl = [
          OC.Files.getClient().getBaseUrl(),
          this.fileInfo.get('path'),
          this.fileInfo.get('name')
        ].join('/');
        const { dataSetCacheManager } = cornerstoneWADOImageLoader.wadouri;
        const imageId = `wadouri:${fullUrl}`;

        let dataSet;

        const isLoaded = dataSetCacheManager.isLoaded(fullUrl);
        if (isLoaded) {
          dataSet = dataSetCacheManager.get(fullUrl);
        } else {
          dataSet = await dataSetCacheManager.load(fullUrl);
        }

        this.cachedAllAttributes = getDICOMAttributes(dataSet);
        this.attributes = this.cachedAllAttributes.slice();

        this.image = await this.getDICOMImage(imageId, dataSet);

        this.renderThumbnailElement();

        this.loading = false;
      } catch (error) {
        this.error = t('dicomviewer', 'Unable to load the DICOM attributes');
        this.loading = false;
        console.error('Error loading the DICOM attributes', error);
      }
    },
    async getDICOMImage(imageId, dataSet) {
      try {
        const pixelDataElement = dataSet.elements.x7fe00010 || dataSet.elements.x7fe00008;
        if (!pixelDataElement) {
          console.warn('No pixel data');
          return;
        }

        const { loadImageFromPromise } = cornerstoneWADOImageLoader.wadouri;
        const imageLoadObject = loadImageFromPromise(Promise.resolve(dataSet), imageId);
        return await imageLoadObject.promise;
      } catch (error) {
        console.warn('No image loaded');
        return null;
      }
    },
    renderThumbnailElement() {
      if (!this.thumbnailElement || !this.image) {
        return;
      }

      // TODO: Get rid of this workaround if nextcloud calls a function when tab is activated
      this.clearRenderThumbnailInterval();
      const tab = document.getElementById('tab-dicomviewer');
      if (tab && tab.className.includes('active')) {
        cornerstone.enable(this.thumbnailElement);
        cornerstone.displayImage(this.thumbnailElement, this.image);
      } else {
        this.renderThumbnailInterval = setInterval(() => this.renderThumbnailElement(), 1000);
      }
    },
    clearRenderThumbnailInterval() {
      if (!this.renderThumbnailInterval) {
        return;
      }
      clearInterval(this.renderThumbnailInterval);
      this.renderThumbnailInterval = null;
    },
    search() {
      if (!this.attributeSearchText) {
        this.attributes = this.cachedAllAttributes.slice();
        return;
      }
      const filter = this.attributeSearchText.toUpperCase();
      this.attributes = this.cachedAllAttributes.filter(attr =>
          (attr.tagName && attr.tagName.toUpperCase().indexOf(filter) > -1) ||
          (attr.tagName && attr.tagName.toUpperCase().indexOf(filter.replace(/\s/g, '')) > -1) ||
          (attr.tagValue && attr.tagValue.indexOf(filter) > -1)
      ).slice();
    },
  },
}
</script>
