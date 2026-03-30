import { registerFileAction, FileType, Permission } from '@nextcloud/files';
import { translate as t } from '@nextcloud/l10n';
import { generateUrl } from "@nextcloud/router";
import AppIcon from './AppIcon.js';

function openWithDICOMViewer(node) {
    const dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${node.owner}|${node.fileid}|1`);

    // Open viewer in a new tab
    const tab = window.open('about:blank');
    tab.location = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
    tab.focus();
}

const fileAction = {
    id: 'dicomviewer',
    order: -10000,
    iconSvgInline() {
        return AppIcon;
    },
    displayName() {
        return t('dicomviewer', 'Open with DICOM Viewer');
    },
    enabled({ nodes }) {
        return nodes.length === 1 && (nodes[0].permissions & Permission.READ) !== 0 && nodes[0].type === FileType.Folder;
    },
    async exec({ nodes, view, folder }) {
        openWithDICOMViewer(nodes[0]);
        return true;
    },
};

export default () => {
    registerFileAction(fileAction);
};
