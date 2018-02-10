import $ from 'jquery';
import { cornerstone, cornerstoneTools } from '../../../lib/cornerstonejs';

const defaultTool = {
    left: 'wwwc',
    right: 'zoom',
    middle: 'pan',
};
let activeTool;

const tools = {};

const gestures = {
    zoomTouchPinch: {
        enabled: true,
    },
    panMultiTouch: {
        enabled: true,
    },
    stackScrollMultiTouch: {
        enabled: true,
    },
    doubleTapZoom: {
        enabled: true,
    },
};

let toolDefaultStates = {
    activate: [],
    deactivate: ['length', 'angle', 'annotate', 'ellipticalRoi', 'rectangleRoi'],
    enable: [],
    disable: [],
    disabledToolButtons: [],
    shadowConfig: {
        shadow: false,
        shadowColor: '#000000',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    },
    textBoxConfig: {
        centering: {
            x: true,
            y: true,
        },
    },
};

let initialized = false;

/**
 * Exported "toolManager" Singleton
 */
const toolManager = {
    init() {
        toolManager.addTool('wwwc', {
            mouse: cornerstoneTools.wwwc,
            touch: cornerstoneTools.wwwcTouchDrag,
        });
        toolManager.addTool('zoom', {
            mouse: cornerstoneTools.zoom,
            touch: cornerstoneTools.zoomTouchDrag,
        });
        toolManager.addTool('wwwcRegion', {
            mouse: cornerstoneTools.wwwcRegion,
            touch: cornerstoneTools.wwwcRegionTouch,
        });
        toolManager.addTool('dragProbe', {
            mouse: cornerstoneTools.dragProbe,
            touch: cornerstoneTools.dragProbeTouch,
        });
        toolManager.addTool('pan', {
            mouse: cornerstoneTools.pan,
            touch: cornerstoneTools.panTouchDrag,
        });
        toolManager.addTool('length', {
            mouse: cornerstoneTools.length,
            touch: cornerstoneTools.lengthTouch,
        });
        toolManager.addTool('angle', {
            mouse: cornerstoneTools.simpleAngle,
            touch: cornerstoneTools.simpleAngleTouch,
        });
        toolManager.addTool('magnify', {
            mouse: cornerstoneTools.magnify,
            touch: cornerstoneTools.magnifyTouchDrag,
        });
        toolManager.addTool('ellipticalRoi', {
            mouse: cornerstoneTools.ellipticalRoi,
            touch: cornerstoneTools.ellipticalRoiTouch,
        });
        toolManager.addTool('rectangleRoi', {
            mouse: cornerstoneTools.rectangleRoi,
            touch: cornerstoneTools.rectangleRoiTouch,
        });
        toolManager.addTool('annotate', {
            mouse: cornerstoneTools.arrowAnnotate,
            touch: cornerstoneTools.arrowAnnotateTouch,
        });

        toolManager.addTool('rotate', {
            mouse: cornerstoneTools.rotate,
            touch: cornerstoneTools.rotateTouchDrag,
        });

        this.configureTools();
        initialized = true;
    },

    configureTools() {
        // Get Cornerstone Tools
        const {
            panMultiTouch, textStyle, toolStyle, toolColors
        } = cornerstoneTools;
        const {
            length, arrowAnnotate, zoom, ellipticalRoi, magnify
        } = cornerstoneTools;

        // Set the configuration for the multitouch pan tool
        const multiTouchPanConfig = {
            testPointers: eventData => eventData.numPointers >= 3,
        };
        panMultiTouch.setConfiguration(multiTouchPanConfig);

        // Set text box background color
        textStyle.setBackgroundColor('transparent');

        // Set the tool font and font size
        // context.font = "[style] [variant] [weight] [size]/[line height] [font family]";
        const fontFamily = 'Roboto, OpenSans, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif';
        textStyle.setFont(`15px ${fontFamily}`);

        // Set the tool width
        toolStyle.setToolWidth(2);

        // Set color for inactive tools
        toolColors.setToolColor('rgb(255, 255, 0)');

        // Set color for active tools
        toolColors.setActiveColor('rgb(0, 255, 0)');

        // Set shadow configuration
        const { shadowConfig } = toolManager.getToolDefaultStates();

        // Get some tools config to not override them
        const lengthConfig = length.getConfiguration();
        const ellipticalRoiConfig = ellipticalRoi.getConfiguration();
        const handlesOnHover = { drawHandlesOnHover: true };

        // Add shadow to length tool
        length.setConfiguration(Object.assign({}, lengthConfig, shadowConfig, handlesOnHover));

        // Add shadow to length tool
        ellipticalRoi.setConfiguration(Object.assign({}, ellipticalRoiConfig, shadowConfig));

        // Set the configuration values for the text annotation (Arrow) tool
        const annotateConfig = {
            drawHandles: false,
            arrowFirst: true
        };
        arrowAnnotate.setConfiguration(annotateConfig);

        const zoomConfig = {
            minScale: 0.05,
            maxScale: 10
        };
        zoom.setConfiguration(zoomConfig);

        const magnifyConfig = {
            magnifySize: 300,
            magnificationLevel: 3
        };
        magnify.setConfiguration(magnifyConfig);
    },

    /**
     * This function searches an object to return the keys that contain a specific value
     *
     * @param object {object} The object to be searched
     * @param value The value to be found
     *
     * @returns {array} The keys for which the object has the specified value
     */
    getKeysByValue(object, value) {
        // http://stackoverflow.com/questions/9907419/javascript-object-get-key-by-value
        return Object.keys(object).filter(key => object[key] === value);
    },

    addTool(name, base) {
        tools[name] = base;
    },

    getTools() {
        return tools;
    },

    setToolDefaultStates(states) {
        toolDefaultStates = states;
    },

    getToolDefaultStates() {
        return toolDefaultStates;
    },

    setActiveToolForElement(toolId, element, button) {
        const canvases = $(element).find('canvas');
        if (element.classList.contains('empty') || !canvases.length) {
            return;
        }

        // If button is not defined, we should consider it left
        if (!button) {
            button = 'left';
        }

        // First, deactivate the current active tool
        tools[activeTool.left].mouse.deactivate(element, 1); // 1 means left mouse button
        tools[activeTool.middle].mouse.deactivate(element, 2); // 2 means middle mouse button
        tools[activeTool.right].mouse.deactivate(element, 4); // 3 means right mouse button

        if (tools[activeTool.left].touch) {
            tools[activeTool.left].touch.deactivate(element);
        }

        // Enable tools based on their default states
        Object.keys(toolDefaultStates).forEach((action) => {
            const relevantTools = toolDefaultStates[action];
            if (!relevantTools || !relevantTools.length || action === 'disabledToolButtons') return;
            relevantTools.forEach((toolType) => {
                // the currently active tool has already been deactivated and can be skipped
                if (action === 'deactivate' &&
                    (toolType === activeTool.left ||
                        toolType === activeTool.middle ||
                        toolType === activeTool.right)) {
                    return;
                }

                tools[toolType].mouse[action](
                    element,
                    (action === 'activate' || action === 'deactivate' ? 1 : undefined)
                );
                tools[toolType].touch[action](element);
            });
        });

        // Get the mouse button tools
        let newToolIdLeft = activeTool.left;
        if (button === 'left') {
            newToolIdLeft = toolId;
        }

        // left mouse tool is used for touch as well
        const newCornerstoneToolLeft = tools[newToolIdLeft];

        let newToolIdMiddle = activeTool.middle;
        if (button === 'middle') {
            newToolIdMiddle = toolId;
        }
        const newCornerstoneToolMiddle = cornerstoneTools[newToolIdMiddle];

        let newToolIdRight = activeTool.right;
        if (button === 'right') {
            newToolIdRight = toolId;
        }
        const newCornerstoneToolRight = cornerstoneTools[newToolIdRight];

        // Deactivate scroll wheel tools
        cornerstoneTools.zoomWheel.deactivate(element);
        cornerstoneTools.panMultiTouch.disable(element);
        cornerstoneTools.zoomTouchPinch.disable(element);
        cornerstoneTools.doubleTapZoom.disable(element);

        const multiTouchPanConfig = {
            testPointers(eventData) {
                return (eventData.numPointers >= 2);
            }
        };
        cornerstoneTools.panMultiTouch.setConfiguration(multiTouchPanConfig);

        // This block ensures that all mouse button tools keep working
        if (newToolIdLeft === newToolIdMiddle && newToolIdMiddle === newToolIdRight) {
            // 7 means left mouse button, right mouse button and middle mouse button
            newCornerstoneToolRight.activate(element, 7);
        } else if (newToolIdLeft === newToolIdMiddle) {
            // 3 means left mouse button and middle mouse button
            newCornerstoneToolMiddle.activate(element, 3);
            // 4 means right mouse button
            newCornerstoneToolRight.activate(element, 4);
        } else if (newToolIdMiddle === newToolIdRight) {
            // 6 means right mouse button and middle mouse button
            newCornerstoneToolRight.activate(element, 6);
            // 1 means left mouse button
            newCornerstoneToolLeft.mouse.activate(element, 1);
        } else if (newToolIdLeft === newToolIdRight) {
            // 2 means middle mouse button
            newCornerstoneToolMiddle.activate(element, 2);
            // 5 means left mouse button and right mouse button
            newCornerstoneToolRight.activate(element, 5);
        } else {
            // 1 means left mouse button
            newCornerstoneToolLeft.mouse.activate(element, 1);
            // 2 means middle mouse button
            newCornerstoneToolMiddle.activate(element, 2);
            // 4 means right mouse button
            newCornerstoneToolRight.activate(element, 4);
        }

        if (newCornerstoneToolLeft.touch) {
            newCornerstoneToolLeft.touch.activate(element);
        }

        if (gestures.zoomTouchPinch.enabled === true) {
            // Two finger pinch
            cornerstoneTools.zoomTouchPinch.activate(element);
        }

        if (gestures.panMultiTouch.enabled === true) {
            // Two or >= Two finger pan
            cornerstoneTools.panMultiTouch.activate(element);
        }

        if (gestures.doubleTapZoom.enabled === true) {
            cornerstoneTools.doubleTapZoom.activate(element);
        }
    },

    setActiveTool(toolId, elements, button) {
        if (!initialized) {
            toolManager.init();
        }

        let $elements;
        if (!elements || !elements.length) {
            $elements = $('.imageViewerViewport');
        } else {
            $elements = $(elements);
        }

        const checkElementEnabled = (allElementsEnabled, element) => {
            try {
                cornerstone.getEnabledElement(element);
                return allElementsEnabled;
            } catch (error) {
                return true;
            }
        };

        if ($elements.toArray().reduce(checkElementEnabled, false)) {
            // if at least one element is not enabled, we do not activate tool.
            console.info(`Could not activate tool ${toolId} due to a viewport not being enabled. Try again later.`);
            return;
        }

        if (!activeTool) {
            activeTool = defaultTool;
        }

        // If button is not defined, we should consider it left
        if (!button) {
            button = 'left';
        }

        if (!toolId) {
            toolId = defaultTool[button];
        }

        // Otherwise, set the active tool for all viewport elements
        $elements.each((index, element) => {
            toolManager.setActiveToolForElement(toolId, element, button);
        });

        activeTool[button] = toolId;

        // TODO: Fire an event to update the active tool in toolbar
    },

    getNearbyToolData(element, coords, toolTypes) {
        const allTools = this.getTools();
        const touchDevice = toolManager.isTouchDevice();
        const nearbyTool = {};
        let pointNearTool = false;

        toolTypes.forEach((toolType) => {
            const toolData = cornerstoneTools.getToolState(element, toolType);
            if (!toolData) {
                return;
            }

            toolData.data.forEach((data, index) => {
                let toolInterfaceName = toolType;
                let toolInterface;

                // Edge cases where the tool is not the same as the typeName
                if (toolType === 'simpleAngle') {
                    toolInterfaceName = 'angle';
                } else if (toolType === 'arrowAnnotate') {
                    toolInterfaceName = 'annotate';
                }

                if (touchDevice) {
                    toolInterface = allTools[toolInterfaceName].touch;
                } else {
                    toolInterface = allTools[toolInterfaceName].mouse;
                }

                if (toolInterface.pointNearTool(element, data, coords)) {
                    pointNearTool = true;
                    nearbyTool.tool = data;
                    nearbyTool.index = index;
                    nearbyTool.toolType = toolType;
                }
            });
        });

        return pointNearTool ? nearbyTool : undefined;
    },

    getActiveTool(button) {
        if (!initialized) {
            toolManager.init();
        }

        // If activeTool is not defined, we should set as defaultTool
        if (!activeTool) {
            activeTool = defaultTool;
        }

        // If button is not defined, we should consider it left
        if (!button) {
            button = 'left';
        }

        return activeTool[button];
    },

    isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.MaxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }
};

export { toolManager };
