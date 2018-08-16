import CommandsManager from './classes/CommandsManager';
import { toolManager } from './toolManager';
import { viewportUtils } from './viewportUtils';

export default function () {
    const tools = [{
        id: 'stackScroll',
        name: 'Stack Scroll',
    }, {
        id: 'wwwc',
        name: 'W/L',
    }, {
        id: 'zoom',
        name: 'Zoom',
    }, {
        id: 'angle',
        name: 'Angle',
    }, {
        id: 'dragProbe',
        name: 'Probe',
    }, {
        id: 'ellipticalRoi',
        name: 'Elliptical ROI',
    }, {
        id: 'rectangleRoi',
        name: 'Rectangle ROI',
    }, {
        id: 'magnify',
        name: 'Magnify',
    }, {
        id: 'annotate',
        name: 'Annotate',
    }, {
        id: 'pan',
        name: 'Pan',
    }, {
        id: 'length',
        name: 'Length',
    }, {
        id: 'wwwcRegion',
        name: 'W/L by Region',
    }, {
        id: 'invert',
        name: 'Invert',
        action: viewportUtils.invert,
    }, {
        id: 'flipH',
        name: 'Flip H',
        action: viewportUtils.flipH,
    }, {
        id: 'flipV',
        name: 'Flip V',
        action: viewportUtils.flipV,
    }, {
        id: 'rotateL',
        name: 'Rotate L',
        action: viewportUtils.rotateL,
    }, {
        id: 'rotateR',
        name: 'Rotate R',
        action: viewportUtils.rotateR,
    }, {
        id: 'reset',
        name: 'Reset',
        action: viewportUtils.resetViewport,
    }, {
        id: 'clearTools',
        name: 'Clear',
        action: viewportUtils.clearTools,
    }, {
        id: 'toggleCaptureImageDialog',
        name: 'Download',
        action: viewportUtils.toggleCaptureImageDialog,
    }];

    const commandsManager = new CommandsManager();

    tools.forEach((tool) => {
        commandsManager.register(tool.id, {
            name: tool.name,
            action: tool.action || (() => toolManager.setActiveTool(tool.id)),
        });
    });

    return commandsManager;
}
