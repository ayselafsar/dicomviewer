function disableAllTools(element) {
    cornerstoneTools.wwwc.disable(element);
    cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(element, 1);
    cornerstoneTools.length.deactivate(element, 1);
    cornerstoneTools.ellipticalRoi.deactivate(element, 1);
    cornerstoneTools.rectangleRoi.deactivate(element, 1);
    cornerstoneTools.angle.deactivate(element, 1);
}

function activate(selectedElem) {
    const tools = document.querySelectorAll('.tool-button-container');

    for (let i = 0; i < tools.length; i += 1) {
        const elem = tools[i];

        elem.classList.remove('active');
    }

    selectedElem.classList.add('active');
}

// Bind events for tools
function bindTools(element) {
    const tools = document.querySelectorAll('.tool-button-container');
    for (let i = 0; i < tools.length; i += 1) {
        const elem = tools[i];

        elem.addEventListener('click', (e) => {
            const toolId = e.target.id;

            if (!toolId) {
                return;
            }

            if (toolId === 'clear') {
                const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;

                toolStateManager.clear(element);
                cornerstone.updateImage(element);

                return;
            } else if (toolId === 'reset') {
                cornerstone.reset(element);

                return;
            } else if (toolId === 'invert') {
                const viewport = cornerstone.getViewport(element);
                viewport.invert = !viewport.invert;

                cornerstone.setViewport(element, viewport);

                return;
            }

            disableAllTools(element);
            activate(e.target);

            if (toolId === 'zoom') {
                cornerstoneTools.zoom.activate(element, 5);
            } else if (toolId === 'pan') {
                cornerstoneTools.pan.activate(element, 3);
            } else {
                cornerstoneTools[toolId].activate(element, 1);
            }
        });
    }
}
