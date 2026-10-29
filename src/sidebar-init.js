import { createApp } from 'vue';
import { FileType, getSidebar } from '@nextcloud/files';
import { translate as t, translatePlural as n } from '@nextcloud/l10n';
import SidebarPreview from './views/SidebarPreview.vue';
import configureCodecs from './utils/configureCodecs.js';
import AppIcon from './utils/AppIcon.js';

const TAG_NAME = 'dicomviewer-files-sidebar-tab';

configureCodecs();

class DicomviewerFilesSidebarTab extends HTMLElement {

    constructor() {
        super();
        this._node = null;
        this._active = false;
        this.vueApp = null;
        this.vueInstance = null;
    }

    connectedCallback() {
        if (!this.vueApp) {
            const container = document.createElement('div');
            this.appendChild(container);
            const app = createApp(SidebarPreview);
            app.config.globalProperties.t = t;
            app.config.globalProperties.n = n;
            this.vueApp = app;
            this.vueInstance = app.mount(container);
        }
        this.syncProps();
    }

    disconnectedCallback() {
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
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
