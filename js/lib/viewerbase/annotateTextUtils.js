import $ from 'jquery';
import { viewportUtils } from './viewportUtils';
import { isTouchDevice } from './isTouchDevice';

const getTextCallback = (doneChangingTextCallback) => {
    const dialog = $('#annotationDialog');
    if (dialog.get(0).open === true) {
        return;
    }

    const getTextInput = $('.annotationTextInput');

    const closeHandler = () => {
        dialog.get(0).close();
        doneChangingTextCallback(getTextInput.val());
        // Reset the text value
        getTextInput.val('');

        // Reset the focus to the active viewport element
        // This makes the mobile Safari keyboard close
        const element = viewportUtils.getActiveViewportElement();
        $(element).focus();
    };

    // This handles the text entry for the annotation tool
    const keyPressHandler = (e) => {
        // If Enter or Esc are pressed, close the dialog
        if (e.which === 13 || e.which === 27) {
            closeHandler();
        }
    };

    // Focus on the text input to open the Safari keyboard
    getTextInput.focus();

    dialog.get(0).showModal();

    const confirm = dialog.find('.annotationDialogConfirm');
    confirm.off('click');
    confirm.on('click', () => {
        closeHandler();
    });

    // Use keydown since keypress doesn't handle ESC in Chrome
    dialog.off('keydown');
    dialog.on('keydown', keyPressHandler);
};

const changeTextCallback = (data, eventData, doneChangingTextCallback) => {
    const dialog = $('#relabelAnnotationDialog');
    if (dialog.get(0).open === true) {
        return;
    }

    if (isTouchDevice()) {
        // Center the dialog on screen on touch devices
        dialog.css({
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto'
        });
    } else {
        // Place the dialog above the tool that is being relabelled
        dialog.css({
            top: eventData.currentPoints.page.y - dialog.outerHeight() - 20,
            left: eventData.currentPoints.page.x - (dialog.outerWidth() / 2)
        });
    }

    const getTextInput = dialog.find('.annotationTextInput');
    const confirm = dialog.find('.relabelConfirm');
    const remove = dialog.find('.relabelRemove');

    getTextInput.val(data.text);

    // Focus on the text input to open the Safari keyboard
    getTextInput.focus();

    dialog.get(0).showModal();

    confirm.off('click');
    confirm.on('click', () => {
        dialog.get(0).close();
        doneChangingTextCallback(data, getTextInput.val());
    });

    // If the remove button is clicked, delete this marker
    remove.off('click');
    remove.on('click', () => {
        dialog.get(0).close();
        doneChangingTextCallback(data, undefined, true);
    });

    const closeHandler = () => {
        dialog.get(0).close();
        doneChangingTextCallback(data, getTextInput.val());
        // Reset the text value
        getTextInput.val('');

        // Reset the focus to the active viewport element
        // This makes the mobile Safari keyboard close
        const element = viewportUtils.getActiveViewportElement();
        $(element).focus();
    };

    const keyPressHandler = (e) => {
        // If Enter is pressed, close the dialog
        if (e.which === 13) {
            closeHandler();
        }
    };

    dialog.off('keydown');
    dialog.on('keydown', keyPressHandler);
};

const annotateTextUtils = {
    getTextCallback,
    changeTextCallback
};

export { annotateTextUtils };
