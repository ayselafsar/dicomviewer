/* eslint import/no-extraneous-dependencies:0 */

import Handlebars from 'handlebars';
import { DCMViewer } from '../../lib/viewerMain';

const tools = [{
    id: 'stackScroll',
    title: window.t('dicomviewer', 'Stack Scroll'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-bars fa-lg',
}, {
    id: 'wwwc',
    title: window.t('dicomviewer', 'Levels'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-sun-o fa-lg',
}, {
    id: 'wwwcRegion',
    title: window.t('dicomviewer', 'ROI Window'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square fa-lg',
}, {
    id: 'zoom',
    title: window.t('dicomviewer', 'Zoom'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-search fa-lg',
}, {
    id: 'pan',
    title: window.t('dicomviewer', 'Pan'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows fa-lg',
}, {
    id: 'invert',
    title: window.t('dicomviewer', 'Invert'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-adjust fa-lg',
}, {
    id: 'flipH',
    title: window.t('dicomviewer', 'Flip H'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-h fa-lg',
}, {
    id: 'flipV',
    title: window.t('dicomviewer', 'Flip V'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-v fa-lg',
}, {
    id: 'rotateL',
    title: window.t('dicomviewer', 'Rotate L'),
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-left',
}, {
    id: 'rotateR',
    title: window.t('dicomviewer', 'Rotate R'),
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-right'
}, {
    id: 'reset',
    title: window.t('dicomviewer', 'Reset'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-undo fa-lg',
}, {
    id: 'magnify',
    title: window.t('dicomviewer', 'Magnify'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-circle'
}, {
    id: 'length',
    title: window.t('dicomviewer', 'Length'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows-v fa-lg',
}, {
    id: 'annotate',
    title: window.t('dicomviewer', 'Annotate'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-long-arrow-down fa-lg',
}, {
    id: 'dragProbe',
    title: window.t('dicomviewer', 'Probe'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-dot-circle-o fa-lg',
}, {
    id: 'ellipticalRoi',
    title: window.t('dicomviewer', 'Elliptical ROI'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-circle-o fa-lg',
}, {
    id: 'rectangleRoi',
    title: window.t('dicomviewer', 'Rectangle ROI'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square-o fa-lg',
}, {
    id: 'angle',
    title: window.t('dicomviewer', 'Angle'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-angle-left fa-lg',
}, {
    id: 'clearTools',
    title: window.t('dicomviewer', 'Clear'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-trash fa-lg',
}, {
    id: 'toggleCaptureImageDialog',
    title: window.t('dicomviewer', 'Capture'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-camera fa-lg',
}];


Handlebars.registerHelper('toolbarButtons', () => {
    const activeTool = DCMViewer.tools.toolManager.getActiveTool();

    // Highlight active tool
    tools.forEach((tool) => {
        tool.toolActive = (tool.id === activeTool);
    });

    return tools;
});
