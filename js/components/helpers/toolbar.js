import Handlebars from 'handlebars';
import { DCMViewer } from '../../lib/components/viewerMain';

const tools = [{
    id: 'stackScroll',
    title: 'Stack Scroll',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-bars fa-lg',
}, {
    id: 'wwwc',
    title: 'Levels',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-sun-o fa-lg',
}, {
    id: 'zoom',
    title: 'Zoom',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-search fa-lg',
}, {
    id: 'pan',
    title: 'Pan',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows fa-lg',
}, {
    id: 'invert',
    title: 'Invert',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-adjust fa-lg',
}, {
    id: 'flipH',
    title: 'Flip H',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-h fa-lg',
}, {
    id: 'flipV',
    title: 'Flip V',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-ellipsis-v fa-lg',
}, {
    id: 'rotateL',
    title: 'Rotate L',
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-left',
}, {
    id: 'rotateR',
    title: 'Rotate R',
    classes: 'imageViewerCommand',
    svgClasses: 'svgContent rotate-right'
}, {
    id: 'wwwcRegion',
    title: 'ROI Window',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square fa-lg',
}, {
    id: 'reset',
    title: 'Reset',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-undo fa-lg',
}, {
    id: 'length',
    title: 'Length',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-arrows-v fa-lg',
}, {
    id: 'dragProbe',
    title: 'Probe',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-dot-circle-o fa-lg',
}, {
    id: 'ellipticalRoi',
    title: 'Elliptical ROI',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-circle-o fa-lg',
}, {
    id: 'rectangleRoi',
    title: 'Rectangle ROI',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-square-o fa-lg',
}, {
    id: 'angle',
    title: 'Angle',
    classes: 'imageViewerTool',
    iconClasses: 'fa fa-angle-left fa-lg',
}, {
    id: 'clearTools',
    title: 'Clear',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-trash fa-lg',
}, {
    id: 'toggleCaptureImageDialog',
    title: 'Capture',
    classes: 'imageViewerCommand',
    iconClasses: 'fa fa-camera fa-lg',
}];


Handlebars.registerHelper('toolbarButtons', () => {
    const activeTool = DCMViewer.tools.toolManager.getActiveTool();

    // Highlight active tool
    tools.forEach(tool => {
        tool.toolActive = (tool.id === activeTool);
    });

    return tools;
});
