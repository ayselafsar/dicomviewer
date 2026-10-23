import { showError } from '@nextcloud/dialogs';
import { translate as t } from '@nextcloud/l10n';

/**
 * Returns true if a WebGL context can be created. Otherwise shows a message
 * and returns false. The viewer draws through WebGL.
 *
 * @return {boolean}
 */
export default function ensureWebGL() {
    let supported = false;
    try {
        const canvas = document.createElement('canvas');
        supported = !!(window.WebGLRenderingContext
            && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        supported = false;
    }

    if (!supported) {
        showError(
            t('dicomviewer', 'DICOM Viewer requires WebGL, which is either disabled or blocked. Either allow WebGL for this site, or try using a different browser.'),
            { timeout: 0 },
        );
    }

    return supported;
}
