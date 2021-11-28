import Vue from 'vue';
import SidebarPreview from './views/SidebarPreview';

Vue.prototype.t = t;
Vue.prototype.n = n;

const SidebarPreviewView = Vue.extend(SidebarPreview);

let SidebarPreviewTabInstance = null;

window.addEventListener('DOMContentLoaded', function() {
    if (OCA.Files && OCA.Files.Sidebar) {
        OCA.Files.Sidebar.registerTab(new OCA.Files.Sidebar.Tab({
            id: 'dicomviewer',
            name: t('dicomviewer', 'DICOM'),
            icon: 'icon-toggle-filelist',
            enabled(fileInfo) {
                return fileInfo && !fileInfo.isDirectory() && fileInfo.mimetype === 'application/dicom';
            },
            async mount(el, fileInfo, context) {
                if (SidebarPreviewTabInstance) {
                    SidebarPreviewTabInstance.$destroy();
                }

                SidebarPreviewTabInstance = new SidebarPreviewView({
                    parent: context,
                });

                await SidebarPreviewTabInstance.update(fileInfo);
                SidebarPreviewTabInstance.$mount(el);
            },
            update(fileInfo) {
                SidebarPreviewTabInstance.update(fileInfo);
            },
            destroy() {
                SidebarPreviewTabInstance.$destroy();
                SidebarPreviewTabInstance = null;
            },
        }));
    }
});
