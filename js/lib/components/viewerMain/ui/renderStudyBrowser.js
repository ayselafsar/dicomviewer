import {DCMViewer} from "../index";
import Handlebars from "handlebars";

/**
 * Renders study browser
 */
export default function renderStudyBrowser() {
    const imageThumbnailSource = $('#imageThumbnailTemplate').html();
    Handlebars.registerPartial("imageThumbnail", imageThumbnailSource);

    const source = $('#studyBrowserTemplate').html();
    const { studies } = DCMViewer.viewerbase.data;

    const template = Handlebars.compile(source);
    const html = template({
        studies,
        isSeriesPanelOpen: DCMViewer.ui.hasMultipleInstances
    });

    $('#studyBrowser').html(html);
};