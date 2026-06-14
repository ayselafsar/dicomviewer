import Vue from 'vue';
import { FileType, getSidebar } from '@nextcloud/files';
import { translate as t } from '@nextcloud/l10n';
import SidebarPreview from './views/SidebarPreview.vue';
import configureCodecs from './utils/configureCodecs.js';
import AppIcon from './utils/AppIcon.js';

Vue.prototype.t = t;
Vue.prototype.n = n;

const TAG_NAME = 'dicomviewer-files-sidebar-tab';
const SidebarPreviewView = Vue.extend(SidebarPreview);

configureCodecs();

class DicomviewerFilesSidebarTab extends HTMLElement {

    constructor() {
        super();
        this._node = null;
        this._active = false;
        this.vueInstance = null;
    }

    connectedCallback() {
        if (!this.vueInstance) {
            this.vueInstance = new SidebarPreviewView();
            this.appendChild(this.vueInstance.$mount().$el);
        }
        this.syncProps();
    }

    disconnectedCallback() {
        if (this.vueInstance) {
            this.vueInstance.$destroy();
            this.vueInstance = null;
        }
    }

    get node() {
        return this._node;
    }

    set node(node) {
        this._node = node;
        this.syncProps();
    }

    get active() {
        return this._active;
    }

    set active(active) {
        this._active = !!active;
        this.syncProps();
    }

    syncProps() {
        if (!this.vueInstance || !this._node) {
            return;
        }
        this.vueInstance.update(this._node, this._active);
    }

}

getSidebar().registerTab({
    id: 'dicomviewer',
    displayName: t('dicomviewer', 'DICOM'),
    iconSvgInline: AppIcon,
    order: 50,
    tagName: TAG_NAME,
    enabled({ node }) {
        return node?.type === FileType.File && node.mime === 'application/dicom';
    },
    async onInit() {
        if (!customElements.get(TAG_NAME)) {
            customElements.define(TAG_NAME, DicomviewerFilesSidebarTab);
        }
    },
});
