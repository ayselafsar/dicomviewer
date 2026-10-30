import { registerFileAction, FileType, Permission, DefaultType } from '@nextcloud/files';
import { translate as t } from '@nextcloud/l10n';
import { generateUrl } from "@nextcloud/router";
import AppIcon from './AppIcon.js';
import isPublicPage from './isPublicPage.js';
import getPublicShareToken from './getPublicShareToken.js';
import ensureWebGL from './ensureWebGL.js';

const DICOM_MIMES = ['application/dicom', 'application/dcm'];

function openWithDICOMViewer(node, singleFile) {
    if (!ensureWebGL()) {
        return;
    }

    const isPublic = isPublicPage();
    let dicomUrl;

    if (isPublic) {
        const shareToken = getPublicShareToken();
        dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/publicdicomjson?file=${shareToken}|${node.path}`);
    } else if (singleFile) {
        dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${node.owner}|${node.fileid}`);
    } else {
        dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${node.owner}|${node.fileid}|1`);
    }

    // Open viewer in a new tab
    const viewerUrl = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
    const tab = window.open('about:blank');
    if (!tab) {
        return;
    }
    tab.location = viewerUrl;
    tab.focus();
}

function canRead(nodes) {
    return nodes.length === 1 && (nodes[0].permissions & Permission.READ) !== 0;
}

const folderAction = {
    id: 'dicomviewer',
    order: -10000,
    iconSvgInline() {
        return AppIcon;
    },
    displayName() {
        return t('dicomviewer', 'Open with DICOM Viewer');
    },
    enabled({ nodes }) {
        return canRead(nodes) && nodes[0].type === FileType.Folder;
    },
    async exec({ nodes }) {
        openWithDICOMViewer(nodes[0], false);
        return true;
    },
};

const fileAction = {
    id: 'dicomviewer-file',
    order: -10000,
    default: DefaultType.DEFAULT,
    iconSvgInline() {
        return AppIcon;
    },
    displayName() {
        return t('dicomviewer', 'Open with DICOM Viewer');
    },
    enabled({ nodes }) {
        return canRead(nodes)
            && nodes[0].type === FileType.File
            && DICOM_MIMES.includes(nodes[0].mime);
    },
    async exec({ nodes }) {
        openWithDICOMViewer(nodes[0], true);
        return true;
    },
};

export default () => {
    registerFileAction(folderAction);
    registerFileAction(fileAction);
};
