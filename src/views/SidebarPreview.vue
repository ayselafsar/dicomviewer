<template>
	<div :class="{ 'icon-loading': loading }">
		<div v-if="error">
			{{ error }}
		</div>
		<template v-else>
			<div :style="{ display: 'flex', justifyContent: 'center' }">
				<div ref="thumbnailElement" :style="{ width: '256px', height: '256px' }" />
			</div>
			<div>
				<h3>{{ t('dicomviewer', 'DICOM Attributes') }}</h3>
				<div>
					<input v-model="attributeSearchText"
						:style="{ width: '100%', marginBottom: '10px' }"
						:placeholder="t('dicomviewer', 'Search for attributes…')">
				</div>
				<table :style="{ width: '100%', tableLayout: 'fixed' }">
					<tr>
						<th>{{ t('dicomviewer', 'Attribute') }}</th>
						<th>{{ t('dicomviewer', 'Value') }}</th>
					</tr>
					<tr v-for="attribute in attributes"
						:key="attribute.tagName"
						:style="{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 'smaller' }">
						<td :style="{ padding: '5px 0 5px 0' }">
							<p>{{ attribute.tagName }}</p>
							<p>{{ attribute.tagValue }}</p>
						</td>
						<td :style="{ padding: '5px 0 5px 0' }" v-html="attribute.text" />
					</tr>
				</table>
			</div>
			<div v-if="attributes.length === 0 && !loading"
				:style="{ textAlign: 'center', padding: '20px' }">
				{{ t('dicomviewer', 'No DICOM attribute found') }}
			</div>
		</template>
	</div>
</template>

<script>
import _ from 'underscore';
import { cornerstone, cornerstoneWADOImageLoader } from '../utils/cornerstonejs.js';
import getDICOMAttributes from '../utils/dicom/getDICOMAttributes.js';

export default {
    name: 'SidebarPreview',
    data() {
        return {
            error: '',
            loading: true,
            node: null,
            active: false,
            cachedAllAttributes: [],
            attributes: [],
            attributeSearchText: '',
        };
    },
    watch: {
        attributeSearchText() {
            this.debouncedSearch();
        },
        active() {
            this.renderThumbnailElement();
        },
    },
    created() {
        this.debouncedSearch = _.debounce(this.search, 500);
    },
    mounted() {
        this.thumbnailElement = this.$refs.thumbnailElement;
        this.renderThumbnailElement();
    },
    methods: {
        async update(node, active = false) {
            this.node = node;
            this.active = active;
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

                const fullUrl = this.node.source;
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

            // Render the thumbnail when the tab is active.
            this.clearRenderThumbnailInterval();
            if (this.active) {
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
                (attr.tagName && attr.tagName.toUpperCase().indexOf(filter) > -1)
          || (attr.tagName && attr.tagName.toUpperCase().indexOf(filter.replace(/\s/g, '')) > -1)
          || (attr.tagValue && attr.tagValue.indexOf(filter) > -1)
            ).slice();
        },
    },
}
</script>
