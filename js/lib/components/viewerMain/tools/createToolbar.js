import $ from 'jquery';

/**
 * Create tool buttons and add to the toolbar
 * @param commandManager
 */
export default function (commandManager) {
    const toolbarSectionButtonHandler = () => {
        const $toolbarSectionButton = $('.toolbarSectionButton').not('.toggleSeriesPanelButton, .notTool');
        $toolbarSectionButton.click((e) => {
            const button = e.currentTarget;
            const $button = $(button);
            const id = $(button).attr('id');

            if ($button.hasClass('imageViewerTool')) {
                // Deactivate all tools
                $toolbarSectionButton.removeClass('active');

                // Activate selected tool
                $button.addClass('active');
            } else if ($button.hasClass('imageViewerCommand')) {
                const flashButton = ($element) => {
                    $element.addClass('active');
                    setTimeout(() => {
                        $element.removeClass('active');
                    }, 100);
                };

                flashButton($button);
            }

            commandManager.run(id);
        });
    };

    // Handle click event of tool button
    toolbarSectionButtonHandler();
}
