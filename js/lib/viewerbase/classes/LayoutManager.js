import $ from 'jquery';
import { _ } from 'underscore';
import { DCMViewer } from '../../viewerMain';
import { DCMViewerLog } from '../../DCMViewerLog';
import { DCMViewerManager } from '../../DCMViewerManager';

// Displays Series in Viewports given a Protocol and list of Studies
export class LayoutManager {
    /**
     * Constructor: initializes a Layout Manager object.
     * @param {DOM element}    parentNode DOM element representing the parent node, which wraps the Layout Manager content
     * @param {Array} studies  Array of studies objects that will be rendered in the Viewer. Each object will be rendered in a div.imageViewerViewport
     */
    constructor(parentNode, studies, renderLayout) {
        DCMViewerLog.info('LayoutManager constructor');

        // this.observer = new Tracker.Dependency();
        this.parentNode = parentNode;
        this.studies = studies;
        this.viewportData = [];
        this.layoutProps = {
            rows: 1,
            columns: 1
        };
        this.layoutClassName = this.getLayoutClass();

        this.isZoomed = false;
        this.renderLayout = renderLayout;
    }

    /**
     * Returns the number of viewports rendered, based on layoutProps
     * @return {integer} number of viewports
     */
    getNumberOfViewports() {
        return this.layoutProps.rows * this.layoutProps.columns;
    }

    /**
     * It creates a new viewport data. This is useful for the first rendering when no viewportData is set yet.
     */
    setDefaultViewportData() {
        DCMViewerLog.info('LayoutManager setDefaultViewportData');

        const self = this;

        // Get the number of viewports to be rendered
        const viewportsAmount = this.getNumberOfViewports();

        // Store the old viewport data and reset the current
        const oldViewportData = self.viewportData;

        // Get the studies and display sets sequence map
        const sequenceMap = this.getDisplaySetSequenceMap();

        // Check if the display sets are sequenced
        const isSequenced = this.isDisplaySetsSequenced(sequenceMap);

        // Define the current viewport index and the viewport data array
        let currentViewportIndex = 0;
        if (viewportsAmount > oldViewportData.length && oldViewportData.length && isSequenced) {
            // Keep the displayed display sets
            self.viewportData = oldViewportData;
            currentViewportIndex = oldViewportData.length;
        } else if (viewportsAmount <= oldViewportData.length) {
            // Reduce the original displayed display sets
            self.viewportData = oldViewportData.slice(0, viewportsAmount);
            return;
        } else {
            // Reset all display sets
            self.viewportData = [];
        }

        // Get all the display sets for the viewer studies
        const displaySets = [];
        this.studies.forEach((study) => {
            study.displaySets.forEach(dSet => dSet.images.length && displaySets.push(dSet));
        });

        // Get the display sets that will be appended to the current ones
        let appendix;
        const currentLength = self.viewportData.length;
        if (currentLength) {
            // TODO: isolate displaySets array by study (maybe a map?)
            const beginIndex = sequenceMap.values().next().value[0].displaySetIndex + currentLength;
            const endIndex = beginIndex + (viewportsAmount - currentLength);
            appendix = displaySets.slice(beginIndex, endIndex);
        } else {
            // Get available display sets from the first to the grid size
            appendix = displaySets.slice(0, viewportsAmount);
        }

        // Generate the additional data based on the appendix
        const additionalData = [];
        appendix.forEach((displaySet, index) => {
            const {
                images, studyInstanceUid, seriesInstanceUid, displaySetInstanceUid
            } = displaySet;
            const sopInstanceUid = images[0] && images[0].getSOPInstanceUID ? images[0].getSOPInstanceUID() : '';
            const viewportIndex = currentViewportIndex + index;
            const data = {
                viewportIndex,
                studyInstanceUid,
                seriesInstanceUid,
                displaySetInstanceUid,
                sopInstanceUid
            };

            additionalData.push(data);
        });

        // Append the additional data with the viewport data
        self.viewportData = self.viewportData.concat(additionalData);

        // Push empty objects if the amount is lesser than the grid size
        while (self.viewportData.length < viewportsAmount) {
            self.viewportData.push({});
        }
    }

    /**
     * Returns the name of the class to be added to the parentNode
     * @return {string} class name following the pattern layout-<rows>-<columns>. Ex: layout-1-1, layout-2-2
     */
    getLayoutClass() {
        const { rows, columns } = this.layoutProps;
        const layoutClass = `layout-${rows}-${columns}`;

        return layoutClass;
    }

    /**
     * Add a class to the parentNode based on the layout configuration.
     * This function is helpful to style the layout of viewports.
     * Besides that, each inner div.viewportContainer will have helpful classes
     * as well. See viewer/components/gridLayout/ component in this ohif-viewerbase package.
     */
    updateLayoutClass() {
        const newLayoutClass = this.getLayoutClass();

        // If layout has changed, change its class
        if (this.layoutClassName !== newLayoutClass) {
            this.parentNode.classList.remove(this.layoutClassName);
        }

        this.layoutClassName = newLayoutClass;

        this.parentNode.classList.add(newLayoutClass);
    }

    /**
     * Updates the grid with the new layout props.
     * It iterates over all viewportData to render the studies
     * in the viewports.
     * If no viewportData or no viewports defined, it renders the default viewport data.
     */
    updateViewports() {
        DCMViewerLog.info('LayoutManager updateViewports');

        if (!this.viewportData ||
            !this.viewportData.length ||
            this.viewportData.length !== this.getNumberOfViewports()) {
            this.setDefaultViewportData();
        }

        // imageViewerViewports occasionally needs relevant layout data in order to set
        // the element style of the viewport in question
        const { layoutProps } = this;
        const data = $.extend({
            viewportData: []
        }, layoutProps);

        this.viewportData.forEach((viewportData) => {
            const viewportDataAndLayoutProps = $.extend(viewportData, layoutProps);
            data.viewportData.push(viewportDataAndLayoutProps);
        });

        this.isZoomed = false;

        this.renderLayout(data.viewportData[0]);
    }

    /**
     * This function destroys and re-renders the imageViewerViewport template.
     * It uses the data provided to load a new display set into the produced viewport.
     * @param  {integer} viewportIndex index of the viewport to be re-rendered
     * @param  {Object} data           instance data object
     */
    rerenderViewportWithNewDisplaySet(viewportIndex, viewportData) {
        // Clone the data to prevent changing the original object
        const data = _.clone(viewportData);

        DCMViewerLog.info(`LayoutManager rerenderViewportWithNewDisplaySet: ${viewportIndex}`);

        // The parent container is identified because it is later removed from the DOM
        const element = $('.imageViewerViewport').eq(viewportIndex);

        // Record the current viewportIndex so this can be passed into the re-rendering call
        data.viewportIndex = viewportIndex;

        // Update the dictionary of loaded displaySet for the specified viewport
        this.viewportData[viewportIndex] = {
            viewportIndex,
            displaySetInstanceUid: data.displaySetInstanceUid,
            seriesInstanceUid: data.seriesInstanceUid,
            studyInstanceUid: data.studyInstanceUid,
            renderedCallback: data.renderedCallback,
            currentImageIdIndex: data.currentImageIdIndex || 0
        };

        // Remove the hover styling
        element.find('canvas').not('.magnifyTool').removeClass('faded');

        const newViewportContainer = document.createElement('div');
        newViewportContainer.className = 'removable';

        this.renderLayout(this.viewportData[0]);
    }

    /**
     * Enlarge a single viewport. Useful when the layout has more than one viewport
     * @param  {integer} viewportIndex Index of the viewport to be enlarged
     */
    enlargeViewport(viewportIndex) {
        DCMViewerLog.info(`LayoutManager enlargeViewport: ${viewportIndex}`);

        if (!this.viewportData ||
            !this.viewportData.length) {
            return;
        }

        // Clone the array for later
        this.previousViewportData = this.viewportData.slice(0);

        const singleViewportData = $.extend({}, this.viewportData[viewportIndex]);
        singleViewportData.rows = 1;
        singleViewportData.columns = 1;
        singleViewportData.viewportIndex = 0;

        const data = {
            viewportData: [singleViewportData],
            rows: 1,
            columns: 1
        };

        $(this.parentNode).html('');

        this.isZoomed = true;
        this.zoomedViewportIndex = viewportIndex;
        this.viewportData = data.viewportData;

        this.updateSession();
    }

    /**
     * Resets to the previous layout configuration.
     * Useful after enlarging a single viewport.
     */
    resetPreviousLayout() {
        DCMViewerLog.info('LayoutManager resetPreviousLayout');

        if (!this.isZoomed) {
            return;
        }

        this.previousViewportData[this.zoomedViewportIndex] = $.extend({}, this.viewportData[0]);
        this.previousViewportData[this.zoomedViewportIndex].viewportIndex = this.zoomedViewportIndex;
        this.viewportData = this.previousViewportData;
        this.updateViewports();
    }

    /**
     * Toogle viewport enlargement.
     * Useful for user to enlarge or going back to previous layout configurations
     * @param  {integer} viewportIndex Index of the viewport to be toggled
     */
    toggleEnlargement(viewportIndex) {
        DCMViewerLog.info(`LayoutManager toggleEnlargement: ${viewportIndex}`);

        if (this.isZoomed) {
            this.resetPreviousLayout();
        } else if (this.getNumberOfViewports() > 1) {
            // Don't enlarge the viewport if we only have one Viewport
            // to begin with
            this.enlargeViewport(viewportIndex);
        }
    }

    /**
     * Return the display sets map sequence of display sets and viewports
     */
    getDisplaySetSequenceMap() {
        DCMViewerLog.info('LayoutManager getDisplaySetSequenceMap');

        // Get the viewport data list
        const viewportDataList = this.viewportData;

        // Create a map to control the display set sequence
        const sequenceMap = new Map();

        // Iterate over each viewport and register its  details on the sequence map
        viewportDataList.forEach((viewportData, viewportIndex) => {
            // Get the current study
            const currentStudy = _.findWhere(this.studies, {
                studyInstanceUid: viewportData.studyInstanceUid
            }) || this.studies[0];

            // Get the display sets
            const { displaySets } = currentStudy;

            // Get the current display set
            const displaySet = _.findWhere(displaySets, {
                displaySetInstanceUid: viewportData.displaySetInstanceUid
            });

            // Get the current instance index (using 9999 to sort greater than -1)
            let displaySetIndex = _.indexOf(displaySets, displaySet);
            displaySetIndex = displaySetIndex < 0 ? 9999 : displaySetIndex;

            // Try to get a map entry for current study or create it if not present
            let studyViewports = sequenceMap.get(currentStudy);
            if (!studyViewports) {
                studyViewports = [];
                sequenceMap.set(currentStudy, studyViewports);
            }

            // Register the viewport index and the display set index on the map
            studyViewports.push({
                viewportIndex,
                displaySetIndex
            });
        });

        // Return the generated sequence map
        return sequenceMap;
    }

    /**
     * Check if all the display sets and viewports are sequenced
     * @param  {Array}  definedSequenceMap Array of display set sequence map
     * @return {Boolean}                   Returns if the display set sequence map is sequenced or not
     */
    isDisplaySetsSequenced(definedSequenceMap) {
        DCMViewerLog.info('LayoutManager isDisplaySetsSequenced');

        let isSequenced = true;

        // Get the studies and display sets sequence map
        const sequenceMap = definedSequenceMap || this.getDisplaySetSequenceMap();

        sequenceMap.forEach((studyViewports) => {
            let lastDisplaySetIndex = null;
            let lastViewportIndex = null;
            studyViewports.forEach(({ viewportIndex, displaySetIndex }) => {
                // Check if the sequence is wrong
                if (
                    displaySetIndex !== 9999 &&
                    lastViewportIndex !== null &&
                    lastDisplaySetIndex !== null &&
                    displaySetIndex !== null &&
                    (viewportIndex - 1 !== lastViewportIndex ||
                        displaySetIndex - 1 !== lastDisplaySetIndex)
                ) {
                    // Set the sequenced flag as false;
                    isSequenced = false;
                }

                // Update the last viewport index
                lastViewportIndex = viewportIndex;

                // Update the last display set index
                lastDisplaySetIndex = displaySetIndex;
            });
        });

        return isSequenced;
    }

    /**
     * Check if is possible to move display sets on a specific direction.
     * It checks if looping is allowed by DCMViewerManager.uiSettings.displaySetNavigationLoopOverSeries
     * @param  {Boolean} isNext Represents the direction
     * @return {Boolean}        Returns if display sets can be moved
     */
    canMoveDisplaySets(isNext) {
        DCMViewerLog.info('LayoutManager canMoveDisplaySets');

        // Get the setting that defines if the display set navigation is multiple
        const isMultiple = DCMViewerManager.uiSettings.displaySetNavigationMultipleViewports;

        // Get the setting that allow display set navigation looping over series
        const allowLooping = DCMViewerManager.uiSettings.displaySetNavigationLoopOverSeries;

        // Get the studies and display sets sequence map
        const sequenceMap = this.getDisplaySetSequenceMap();

        // Check if the display sets are sequenced
        const isSequenced = this.isDisplaySetsSequenced(sequenceMap);

        // Get Active Viewport Index if isMultiple is false
        const activeViewportIndex = !isMultiple ? DCMViewerManager.sessions.activeViewport : null;

        // Check if is next and looping is blocked
        if (isNext && !allowLooping) {
            // Check if the end was reached
            let endReached = true;

            sequenceMap.forEach((studyViewports, study) => {
                // Get active viewport index if isMultiple is false ortherwise get last
                const studyViewport = studyViewports[activeViewportIndex !== null ? activeViewportIndex : studyViewports.length - 1];
                if (!studyViewport) {
                    return;
                }

                const viewportIndex = studyViewport.displaySetIndex;
                const layoutViewports = studyViewports.length;
                const amount = study.displaySets.length;
                const move = !isMultiple ? 1 : ((amount % layoutViewports) || layoutViewports);
                const lastStepIndex = amount - move;

                // 9999 for index means empty viewport, see getDisplaySetSequenceMap function
                if (viewportIndex !== 9999 && viewportIndex !== lastStepIndex) {
                    endReached = false;
                }
            });

            // Return false if end is not reached yet
            if ((!isMultiple || isSequenced) && endReached) {
                return false;
            }
        }

        // Check if is previous and looping is blocked
        if (!isNext && !allowLooping) {
            // Check if the begin was reached
            let beginReached = true;

            if (activeViewportIndex >= 0) {
                sequenceMap.forEach((studyViewports) => {
                    // Get active viewport index if isMultiple is false ortherwise get first
                    const studyViewport = studyViewports[activeViewportIndex !== null ? activeViewportIndex : 0];
                    if (!studyViewport) {
                        return;
                    }

                    const viewportIndex = studyViewport.displaySetIndex;
                    const layoutViewports = studyViewports.length;

                    // 9999 for index means empty viewport, see getDisplaySetSequenceMap function
                    if (viewportIndex !== 9999 && viewportIndex - layoutViewports !== -layoutViewports) {
                        beginReached = false;
                    }
                });
            }

            // Return false if begin is not reached yet
            if ((!isMultiple || isSequenced) && beginReached) {
                return false;
            }
        }

        return true;
    }

    /**
     * Move display sets forward or backward in the given viewport index
     * @param  {integer}  viewportIndex Index of the viewport to be moved
     * @param  {Boolean} isNext         Represents the direction (true = forward, false = backward)
     */
    moveSingleViewportDisplaySets(viewportIndex, isNext) {
        DCMViewerLog.info(`LayoutManager moveSingleViewportDisplaySets: ${viewportIndex}`);

        // Get the setting that allow display set navigation looping over series
        const allowLooping = DCMViewerManager.uiSettings.displaySetNavigationLoopOverSeries;

        // Get the selected viewport data
        const viewportData = this.viewportData[viewportIndex];

        // Get the current study
        const currentStudy = _.findWhere(this.studies, {
            studyInstanceUid: viewportData.studyInstanceUid
        }) || this.studies[0];

        // Get the display sets
        const { displaySets } = currentStudy;

        // Get the current display set
        const currentDisplaySet = _.findWhere(displaySets, {
            displaySetInstanceUid: viewportData.displaySetInstanceUid
        });

        // Get the new index and ensure that it will exists in display sets
        let newIndex = _.indexOf(displaySets, currentDisplaySet);
        if (isNext) {
            newIndex++;
            if (newIndex >= displaySets.length) {
                // Stop here if looping is not allowed
                if (!allowLooping) {
                    return;
                }

                newIndex = 0;
            }
        } else {
            newIndex--;
            if (newIndex < 0) {
                // Stop here if looping is not allowed
                if (!allowLooping) {
                    return;
                }

                newIndex = displaySets.length - 1;
            }
        }

        // Get the display set data for the new index
        const newDisplaySetData = displaySets[newIndex];

        // Rerender the viewport using the new display set data
        this.rerenderViewportWithNewDisplaySet(viewportIndex, newDisplaySetData);
    }

    /**
     * Move multiple display sets forward or backward in all viewports
     * @param  {Boolean} isNext Represents the direction (true = forward, false = backward)
     */
    moveMultipleViewportDisplaySets(isNext) {
        DCMViewerLog.info('LayoutManager moveMultipleViewportDisplaySets');

        // Get the setting that allow display set navigation looping over series
        const allowLooping = DCMViewerManager.uiSettings.displaySetNavigationLoopOverSeries;

        // Create a map to control the display set sequence
        const sequenceMap = this.getDisplaySetSequenceMap();

        // Check if the display sets are sequenced
        const isSequenced = this.isDisplaySetsSequenced(sequenceMap);

        const displaySetsToRender = [];

        // Iterate over the studies map and move its display sets
        sequenceMap.forEach((studyViewports, study) => {
            // Sort the viewports on the study by the display set index
            studyViewports.sort((a, b) => a.displaySetIndex > b.displaySetIndex);

            // Get the study display sets
            const { displaySets } = study;

            // Calculate the base index
            const firstIndex = studyViewports[0].displaySetIndex;
            const steps = studyViewports.length;
            const rest = firstIndex % steps;
            let baseIndex = rest ? firstIndex - rest : firstIndex;
            const direction = isNext ? 1 : -1;
            baseIndex += steps * direction;

            const amount = displaySets.length;

            // Check if the indexes are sequenced or will overflow the array bounds
            if (baseIndex >= amount) {
                const move = (amount % steps) || steps;
                const lastStepIndex = amount - move;
                if (firstIndex + steps !== lastStepIndex + steps) {
                    // Reset the index if the display sets are sequenced but shifted
                    baseIndex = lastStepIndex;
                } else if (!allowLooping) {
                    // Stop here if looping is not allowed
                    return;
                } else {
                    // Start over the series if looping is allowed
                    baseIndex = 0;
                }
            } else if (baseIndex < 0) {
                if (firstIndex > 0) {
                    // Reset the index if the display sets are sequenced but shifted
                    baseIndex = 0;
                } else if (!allowLooping) {
                    // Stop here if looping is not allowed
                    return;
                } else {
                    // Go to the series' end if looping is allowed
                    baseIndex = (amount - 1) - ((amount - 1) % steps);
                }
            } else if (!isSequenced) {
                // Reset the sequence if indexes are not sequenced
                baseIndex = 0;
            }

            // Iterate over the current study viewports
            studyViewports.forEach((viewport, index) => {
                // Get the new displaySet index to be rendered in viewport
                const newIndex = baseIndex + index;

                // Get the display set data for the new index
                const displaySetData = displaySets[newIndex] || {};

                // Add the current display set that on the render list
                displaySetsToRender.push(displaySetData);
            });
        });

        // Sort the display sets
        const sortingFunction = DCMViewer.utils.sortBy({
            name: 'studyInstanceUid'
        }, {
            name: 'instanceNumber'
        }, {
            name: 'seriesNumber'
        });
        displaySetsToRender.sort((a, b) => sortingFunction(a, b));

        // Iterate over each display set data and render on its respective viewport
        displaySetsToRender.forEach((data, index) => {
            this.rerenderViewportWithNewDisplaySet(index, data);
        });
    }

    /**
     * Move display sets forward or backward
     * @param  {Boolean} isNext Represents the direction (true = forward, false = backward)
     */
    moveDisplaySets(isNext) {
        DCMViewerLog.info('LayoutManager moveDisplaySets');

        // Check if navigation is on a single or multiple viewports
        if (DCMViewerManager.uiSettings.displaySetNavigationMultipleViewports) {
            // Move display sets on multiple viewports
            this.moveMultipleViewportDisplaySets(isNext);
        } else {
            // Get the selected viewport index
            const viewportIndex = DCMViewerManager.sessions.activeViewport;

            // Move display sets on a single viewport
            this.moveSingleViewportDisplaySets(viewportIndex, isNext);
        }
    }

    /**
     * Check if a study is loaded into a viewport
     * @param  {string}  studyInstanceUid Study instance Uid string
     * @param  {integer}  viewportIndex   Index of the viewport to be checked
     * @return {Boolean}                  Returns if the given study is in the given viewport or not
     */
    isStudyLoadedIntoViewport(studyInstanceUid, viewportIndex) {
        return (this.viewportData.find(item => item.studyInstanceUid === studyInstanceUid && item.viewportIndex === viewportIndex) !== undefined);
    }

    /**
     * Check if the layout has multiple rows and columns
     * @return {Boolean} Return if the layout has multiple rows and columns or not
     */
    isMultipleLayout() {
        return this.layoutProps.row !== 1 && this.layoutProps.columns !== 1;
    }
}
