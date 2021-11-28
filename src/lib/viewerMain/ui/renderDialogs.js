import $ from 'jquery';
import dialogPolyfill from 'dialog-polyfill';

/**
 * Renders dialogs
 */
export default function renderDialogs() {
    // Wait until all DOM is rendered
    setTimeout(() => {
        const dialogIds = [
            'annotationDialog',
            'relabelAnnotationDialog'
        ];

        dialogIds.forEach((id) => {
            const dialog = $(`#${id}`);
            dialogPolyfill.registerDialog(dialog.get(0));
        });
    }, 300);
}
