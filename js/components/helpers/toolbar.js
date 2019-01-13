/* eslint import/no-extraneous-dependencies:0 */

import Handlebars from 'handlebars';
import { DCMViewer } from '../../lib/viewerMain';

const tools = [{
    id: 'stackScroll',
    title: t('dicomviewer', 'Stack Scroll'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-bars fa-lg',
}, {
    id: 'wwwc',
    title: t('dicomviewer', 'Levels'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-sun-o fa-lg',
}, {
    id: 'wwwcRegion',
    title: t('dicomviewer', 'Levels ROI'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square fa-lg',
}, {
    id: 'zoom',
    title: t('dicomviewer', 'Zoom'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-search fa-lg',
}, {
    id: 'pan',
    title: t('dicomviewer', 'Pan'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows fa-lg',
}, {
    id: 'invert',
    title: t('dicomviewer', 'Invert'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-adjust fa-lg',
}, {
    id: 'flipH',
    title: t('dicomviewer', 'Flip H'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-h fa-lg',
}, {
    id: 'flipV',
    title: t('dicomviewer', 'Flip V'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-v fa-lg',
}, {
    id: 'rotateL',
    title: t('dicomviewer', 'Rotate L'),
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-left',
}, {
    id: 'rotateR',
    title: t('dicomviewer', 'Rotate R'),
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-right'
}, {
    id: 'magnify',
    title: t('dicomviewer', 'Magnify'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-circle'
}, {
    id: 'length',
    title: t('dicomviewer', 'Length'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows-v fa-lg',
}, {
    id: 'angle',
    title: t('dicomviewer', 'Angle'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-angle-left fa-lg',
}, {
    id: 'dragProbe',
    title: t('dicomviewer', 'Probe'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-dot-circle-o fa-lg',
}, {
    id: 'ellipticalRoi',
    title: t('dicomviewer', 'Elliptical ROI'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-circle-o fa-lg',
}, {
    id: 'rectangleRoi',
    title: t('dicomviewer', 'Rectangle ROI'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square-o fa-lg',
}, {
    id: 'annotate',
    title: t('dicomviewer', 'Annotate'),
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-long-arrow-down fa-lg',
}, {
    id: 'clearTools',
    title: t('dicomviewer', 'Clear'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-trash fa-lg',
}, {
    id: 'reset',
    title: t('dicomviewer', 'Reset'),
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-undo fa-lg',
}, {
    id: 'toggleCaptureImageDialog',
    title: t('dicomviewer', 'Capture'),
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
