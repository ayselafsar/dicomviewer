import { registerFileAction, FileAction, FileType, Permission } from '@nextcloud/files';
import { translate as t } from '@nextcloud/l10n';
import { generateUrl } from "@nextcloud/router";
import AppIcon from './AppIcon.js';
import isPublicPage from './isPublicPage.js';
import getPublicShareToken from './getPublicShareToken.js';

function openWithDICOMViewer(node) {
    const isPublic = isPublicPage();
    let viewerUrl;

    if (isPublic) {
        // Route through PublicDisplayController so password-protected shares
        // trigger the Nextcloud auth form when the session has expired.
        const shareToken = getPublicShareToken();
        viewerUrl = shareToken
            ? generateUrl(`/apps/dicomviewer/s/${shareToken}?path=${encodeURIComponent(node.path || '')}`)
            : null;
    } else {
        const dicomUrl = window.location.protocol + '//' + window.location.host + generateUrl(`/apps/dicomviewer/dicomjson?file=${node.owner}|${node.fileid}|1`);
        viewerUrl = generateUrl(`/apps/dicomviewer/ncviewer/viewer/dicomjson?url=${dicomUrl}`);
    }

    if (!viewerUrl) {
        return;
    }

    // Open viewer in a new tab
    const tab = window.open('about:blank');
    tab.location = viewerUrl;
    tab.focus();
}

const fileAction = new FileAction({
    id: 'dicomviewer',
    order: -10000,
    iconSvgInline() {
        return AppIcon;
    },
    displayName() {
        return t('dicomviewer', 'Open with DICOM Viewer');
    },
    enabled(nodes) {
        return nodes.length === 1 && (nodes[0].permissions & Permission.READ) !== 0 && nodes[0].type === FileType.Folder;
    },
    async execBatch(nodes, view, dir) {
        openWithDICOMViewer(nodes[0]);
        return Promise.all([Promise.resolve(true)]);
    },
    async exec(node, view, dir) {
        openWithDICOMViewer(node);
        return true;
    },
});

export default () => {
    registerFileAction(fileAction);
};
