import React from "react";
import {useUpdate} from "react-use";
import {
    ELEMENTS,
    HANDLERS,
    GRID_SIZE,
    IS_DARWIN,
    TOOLS,
    CHANGES,
    KEYS,
    STATUS,
    SNAP_THRESHOLD,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
    FIELDS,
} from "../constants.js";
import {normalizeBounds, getRectangleBounds} from "../utils/math.js";
import {isArrowKey} from "../utils/keys.js";
import {isInputTarget} from "../utils/events.js";
import {
    getElementConfig, 
    createElement,
    getElementsSnappingEdges,
    getElementSnappingPoints,
} from "../elements.js";
import {useEditor} from "../contexts/editor.jsx";

// internal list with all elements
const elementsNames = new Set(Object.values(ELEMENTS));

// @private internal utility to check if the tool is an element
const isElementTool = toolName => {
    return toolName && elementsNames.has(toolName);
};

// @private create a new editor state
const createInitialEditorState = (props, editor) => {
    const isEditorEmpty = editor.pages.length === 1 && editor.page.elements.length === 0;
    const editorState = {
        status: STATUS.IDLE,
        tool: TOOLS.SELECT,
        toolLocked: false,

        visibleSnapEdges: [],

        // @description current selection  
        selection: null,

        selectedLibraryItemId: null,
        selectedLibraryItem: null,
        selectedPage: null,

        // @description state for dialogs
        exportVisible: false,
        pagesVisible: false,
        pageSettingsVisible: false,
        layersVisible: false,
        libraryVisible: false,
        libraryCreateVisible: false,
        libraryAddVisible: false,
        preferencesVisible: false,

        // @description state for welcome items
        hintsVisible: props.showHints && isEditorEmpty,
        welcomeVisible: props.showWelcome && isEditorEmpty,
    };
    return editorState;
};

// @public use editor events listeners
export const useListeners = props => {
    const update = useUpdate();
    const editor = useEditor();
    const listeners = React.useRef(null);

    // Initialize editor listeners
    if (!listeners.current) {
        const editorState = createInitialEditorState(props, editor);

        // @description dispatch a library change
        const dispatchLibraryChange = () => {
            if (typeof onLibraryChangeRef.current === "function") {
                return onLibraryChangeRef.current(library.toJSON());
            }
        };

        // @private get position based on the grid state
        const getPosition = (pos, edge = null, size = 0, includeCenter = false) => {
            // 1. Check if grid mode is enabled
            if (editor?.appState?.grid) {
                return Math.round(pos / GRID_SIZE) * GRID_SIZE;
            }
            // 2. check if snap mode is enabled
            if (edge && editor?.appState?.snapToElements) {
                const edges = size > 0 ? (includeCenter ? [0, size / 2, size] : [0, size]) : [0];
                for (let i = 0; i < snapEdges.length; i++) {
                    const item = snapEdges[i];
                    if (item.edge === edge && typeof item[edge] !== "undefined") {
                        for (let j = 0; j < edges.length; j++) {
                            if (Math.abs(item[edge] - pos - edges[j]) < SNAP_THRESHOLD) {
                                activeSnapEdges.push(item);
                                return item[edge] - edges[j];
                            }
                        }
                    }
                }
            }
            // 3: just return the new position
            return pos;
        };

        // @description remove the current text element
        const removeTextElement = element => {
            // Check if this element has been just created
            // Just remove this history entry
            const history = editor.getHistory();
            if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
                history.shift();
            }
            editor.removeElements([element]);
            dispatchChange();
            update();
        };

        // Internal variables
        let snapshot = [];
        let snapshotBounds = null;
        let snapEdges = [];
        let activeSnapEdges = [];
        let activeElement = null;
        let isDragged = false, isResized = false, isPrevSelected = false;
        let lastTranslateX = 0, lastTranslateY = 0;

        // Editor events
        const editorEvents = {
            onPointCanvas: () => {
                editorState.visibleSnapEdges = [];
                // if (action === ACTIONS.EDIT) {
                if (activeElement) {
                    if (activeElement?.editing) {
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                    }
                    activeElement.editing = false; // Disable editing
                    activeElement = null;
                }
                // Check if we have an active group
                if (editor.page.activeGroup) {
                    editor.page.activeGroup = null;
                    update();
                }
                if (editorState.tool === TOOLS.SELECT) {
                    editor.clearSelection();
                    update();
                }
            },
            onPointElement: event => {
                // if (editorState.tool === TOOLS.SELECT && !action) {
                if (editorState.tool === TOOLS.SELECT) {
                    const element = editor.getElement(event.element);
                    isPrevSelected = element.selected;
                    // Check to reset active group
                    if (editor.page.activeGroup && element.group !== editor.page.activeGroup) {
                        editor.getElements().forEach(el => {
                            el.selected = el.group === editor.page.activeGroup || el.selected;
                        });
                        editor.page.activeGroup = null;
                    }
                    const inCurrentSelection = editor.getSelection().some(el => {
                        return el.id === element.id;
                    });
                    if (!inCurrentSelection && !event.shiftKey) {
                        editor.clearSelection();
                    }
                    element.selected = true;
                    if (!editor.page.activeGroup && element.group) {
                        editor.getElements().forEach(el => {
                            el.selected = el.selected || (el.group && el.group === element.group);
                        });
                    }
                    update();
                }
            },
            // onPointHandler: () => {
            //     action = ACTIONS.RESIZE;
            // },
            onPointerDown: event => {
                isDragged = false;
                isResized = false;
                snapshot = []; // reset snapshot
                const selectedElements = editor.getSelection();
                // First we need to check if we are in a edit action
                if (activeElement?.editing) {
                    if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                        removeTextElement(activeElement);
                    }
                    activeElement = null;
                }
                // 1. check for element tool --> set action to create
                if (isElementTool(editorState.tool)) {
                    const element = createElement(editorState.tool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.(editor.defaults) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
                        x2: getPosition(event.originalX),
                        y2: getPosition(event.originalY),
                        creating: true,
                    });
                    elementConfig.onCreateStart?.(element, event),
                    activeElement = element; // Save element reference
                    // state.activeGroup = null; // Reset current group
                    editor.clearSelection();
                    editor.addElements([element]);
                }
                // 2. check if tool is select and we have an active selection enabled
                else if (editorState.tool === TOOLS.SELECT && selectedElements.length > 0) {
                    if (!selectedElements.some(el => el.locked)) {
                        // make sure that action is defined
                        // action = action || ACTIONS.TRANSLATE;
                        // if (!action) {
                        //     action = ACTIONS.TRANSLATE;
                        // }
                        // Save a snapshot of the current selection for calculating the correct element position
                        snapshot = editor.getSelection().map(el => ({...el}));
                        snapshotBounds = getRectangleBounds(snapshot);
                        // Check for calling the onResizeStart listener
                        // if (action === ACTIONS.RESIZE && snapshot.length === 1) {
                        if (event.handler && snapshot.length === 1) {
                            const element = editor.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeStart === "function") {
                                elementConfig.onResizeStart(element, snapshot[0], event);
                            }
                        }
                    }
                }
                // 3. we are in selection tool without selected elements
                // else if (!editorState.action || editorState.action === ACTIONS.SELECT || editorState.action === ACTIONS.SCREENSHOT) {
                else if (editorState.tool === TOOLS.SELECT && selectedElements.length === 0) {
                    // editorState.action = editorState.action || ACTIONS.SELECT;
                    editorState.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    // editor.clearSelection();
                }
                // 4. we are in drag mode
                else if (editorState.tool === TOOLS.DRAG) {
                    // action = ACTIONS.MOVE;
                    // We need to update the last translated point before start moving the board
                    lastTranslateX = editor.page.translateX;
                    lastTranslateY = editor.page.translateY;
                }
                // 5. we are in erase tool
                // else if (editorState.action === ACTIONS.ERASE) {
                //     editorState.erase = {
                //         x: event.originalX,
                //         y: event.originalY,
                //     };
                // }
                editorState.status = STATUS.POINTING;
                // editorState.contextMenu = false;
                editorState.visibleSnapEdges = [];
                snapEdges = [];
                activeSnapEdges = [];
                // if (action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE) {
                if (editorState.tool === TOOLS.SELECT && selectedElements.length > 0) {
                    if (editor?.appState?.snapToElements) {
                        snapEdges = getElementsSnappingEdges(editor.getElements());
                    }
                }
                update();
            },
            onPointerMove: event => {
                if (editorState.tool === TOOLS.DRAG) {
                    editorState.status = STATUS.DRAGGING;
                    editor.page.translateX = Math.floor(lastTranslateX + event.dx * editor.page.zoom);
                    editor.page.translateY = Math.floor(lastTranslateY + event.dy * editor.page.zoom);
                }
                else if (editorState.tool === TOOLS.ERASER) {
                    editorState.status = STATUS.ERASING;
                    const x = event.originalX + event.dx;
                    const y = event.originalY + event.dy;
                    editor.getElements().forEach(element => {
                        if (!element.erased) {
                            const b = element.type === ELEMENTS.ARROW ? normalizeBounds(element) : element;
                            if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                                element.erased = true;
                            }
                        }
                    });
                }
                else if (isElementTool(editorState.tool)) {
                    editorState.status = STATUS.CREATING;
                    const element = activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event, getPosition);
                }
                // else if (action === ACTIONS.TRANSLATE) {
                else if (editorState.tool === TOOLS.SELECT && snapshot.length > 0 && !event.handler) {
                    editorState.visibleSnapEdges = [];
                    activeSnapEdges = [];
                    editorState.status = STATUS.TRANSLATING;
                    isDragged = true;
                    const elements = editor.getSelection();
                    const includeCenter = elements.length > 1 || elements[0].type !== ELEMENTS.ARROW;
                    const dx = getPosition(snapshotBounds.x1 + event.dx, SNAP_EDGE_X, snapshotBounds.x2 - snapshotBounds.x1, includeCenter) - snapshotBounds.x1;
                    const dy = getPosition(snapshotBounds.y1 + event.dy, SNAP_EDGE_Y, snapshotBounds.y2 - snapshotBounds.y1, includeCenter) - snapshotBounds.y1;
                    elements.forEach((element, index) => {
                        element.x1 = snapshot[index].x1 + dx;
                        element.x2 = snapshot[index].x2 + dx;
                        element.y1 = snapshot[index].y1 + dy;
                        element.y2 = snapshot[index].y2 + dy;
                        // Execute the onDrag function
                        getElementConfig(element)?.onDrag?.(element, snapshot[index], event);
                    });
                    if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
                        const bounds = elements.length === 1 ? elements[0] : getRectangleBounds(elements);
                        editorState.visibleSnapEdges = activeSnapEdges.map(snapEdge => ({
                            // ...snapEdge,
                            points: [
                                ...snapEdge.points,
                                ...getElementSnappingPoints(bounds, snapEdge),
                            ],
                        }));
                    }
                }
                // else if (action === ACTIONS.RESIZE) {
                else if (editorState.tool === TOOLS.SELECT && event.handler) {
                    editorState.visibleSnapEdges = [];
                    editorState.status = STATUS.RESIZING;
                    activeSnapEdges = [];
                    isResized = true;
                    const element = editor.getElement(snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                    }
                    else if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X);
                        element.y1 = getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X);
                        element.y2 = getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y);
                    }
                    // Execute onResize handler
                    elementConfig?.onResize?.(element, snapshot[0], event, getPosition);
                    // Set visible snap edges
                    if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
                        editorState.visibleSnapEdges = activeSnapEdges.map(snapEdge => ({
                            // ...snapEdge,
                            points: [
                                ...snapEdge.points,
                                ...getElementSnappingPoints(element, snapEdge),
                            ],
                        }));
                    }
                }
                // else if (editorState.action === ACTIONS.SELECT || editorState.action === ACTIONS.SCREENSHOT) {
                else if (editorState.tool === TOOLS.SELECT) {
                    editorState.status = STATUS.BRUSHING;
                    editorState.selection.x2 = event.currentX;
                    editorState.selection.y2 = event.currentY;
                }
                // Force editor update
                update();
            },

            // @description handle pointer up
            onPointerUp: event => {
                editorState.visibleSnapEdges = [];
                editorState.status = STATUS.IDLE;
                // if (editorState.action === ACTIONS.MOVE) {
                if (editorState.tool === TOOLS.DRAG) {
                    lastTranslateX = editor.page.translateX;
                    lastTranslateY = editor.page.translateY;
                    return update();
                }
                // else if (editorState.action === ACTIONS.ERASE) {
                else if (editorState.tool === TOOLS.ERASER) {
                    const erasedElements = editor.getErasedElements();
                    editor.removeElements(erasedElements);
                    dispatchChange();
                    return update();
                }
                // else if (editorState.action === ACTIONS.CREATE && activeElement) {
                else if (activeElement && isElementTool(editorState.tool)) {
                    const element = activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    element[FIELDS.VERSION] = 1; // Set as initial version of this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = editor.page.history[0] || {};
                    if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                        last.elements[0].newValues = {
                            ...element,
                            selected: false,
                        };
                    }
                    // Call the element created listener
                    dispatchChange();
                    activeElement = null;
                    // Check if the tool is not the handdraw
                    // TODO: we need also to check if lock is enabled
                    if (!editorState.toolLocked && editorState.tool !== ELEMENTS.DRAW) {
                        editorState.tool = TOOLS.SELECT;
                    }
                    else {
                        // If tool is locked, we need to reset the current selection
                        element.selected = false;
                    }
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        activeElement = element;
                        // action = ACTIONS.EDIT;
                        return update();
                    }
                }
                // else if (action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE) {
                else if (editorState.tool === TOOLS.SELECT && snapshot.length > 0) {
                    if (isDragged || isResized) {
                        if (event.handler && snapshot.length === 1) {
                            const element = editor.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeEnd === "function") {
                                elementConfig.onResizeEnd(element, snapshot[0], event);
                            }
                        }
                        const selectedElements = editor.getSelection();
                        selectedElements.forEach(el => el[FIELDS.VERSION] = el[FIELDS.VERSION] + 1);
                        editor.addHistory({
                            type: CHANGES.UPDATE,
                            elements: selectedElements.map((element, index) => {
                                const updatedFields = new Set(["x1", "x2", "y1", "y2", "version"]);
                                // We need to check the fields that the element has updated internally
                                const elementConfig = getElementConfig(element);
                                if (typeof elementConfig.getUpdatedFields === "function") {
                                    (elementConfig.getUpdatedFields(element, snapshot[index]) || []).forEach(key => {
                                        updatedFields.add(key);
                                    });
                                }
                                // Generate list of fields to update
                                const keys = Array.from(updatedFields);
                                return {
                                    id: element.id,
                                    prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                    newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                                };
                            }),
                        });
                        dispatchChange();
                    }
                    else if (event.element) {
                        const element = editor.getElement(event.element);
                        if (!event.shiftKey) {
                            editor.clearSelection();
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !isPrevSelected;
                        }
                        // Select all elements of this group
                        if (element.group && !editor.page.activeGroup) {
                            editor.getElements().forEach(el => {
                                el.selected = el.group === element.group ? element.selected : el.selected;
                            });
                        }
                    }
                    isDragged = false;
                    isResized = false;
                }
                // else if (editorState.action === ACTIONS.SELECT) {
                else if (editorState.tool === TOOLS.SELECT) {
                    const selection = editorState.selection;
                    editor.setSelection({
                        x1: Math.min(selection.x1, selection.x2),
                        x2: Math.max(selection.x1, selection.x2),
                        y1: Math.min(selection.y1, selection.y2),
                        y2: Math.max(selection.y1, selection.y2),
                    });
                }
                // else if (editorState.action === ACTIONS.SCREENSHOT) {
                //     editorState.exportVisible = true;
                //     editorState.exportRegion = {...editorState.selection};
                // }
                editorState.selection = null;
                // action = null;
                update();
            },

            // @description double click 
            onDoubleClickElement: event => {
                if (!editor.page.readonly && editorState.tool === TOOLS.SELECT) {
                    // board.clearSelectedElements();
                    const element = editor.getElement(event.element);
                    // Check for entering in group edition mode
                    if (!editor.page.activeGroup && element.group) {
                        editor.page.activeGroup = element.group;
                        editor.clearSelection();
                        element.selected = true; // Mark this element as selected
                    }
                    else if (element && !element.locked) {
                        activeElement = element;
                        activeElement.editing = true;
                        // editorState.action = ACTIONS.EDIT;
                    }
                    update();
                }
            },
            
            // @description handle key down
            onKeyDown: event => {
                if (editor.page.readonly) {
                    return null;
                }
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (activeElement?.editing && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        activeElement.editing = false; // Stopediting element
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                        // Force to reset the active element
                        activeElement = null;
                        update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        editor.copyElementsToClipboard(editor.getSelection());
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        editor.removeSelection();
                        dispatchChange();
                    }
                    update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    activeElement = null;
                    event.key === KEYS.Z ? editor.undo() : editor.redo();
                    dispatchChange();
                    update();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    // if (editorState.action === ACTIONS.SCREENSHOT) {
                    //     editorState.action = null;
                    // }
                    // Check for active group enabled --> exit group edition
                    // if (board.activeGroup) {
                    //     board.activeGroup = null;
                    // }
                    event.preventDefault();
                    editor.clearSelection();
                    update();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = editor.getSelection();
                    editor.addHistory({
                        type: CHANGES.UPDATE,
                        ids: selectedElements.map(el => el.id).join(","),
                        keys: `${dir}1,${dir}2`,
                        elements: selectedElements.map(el => {
                            const snapshot = {...el};
                            const field1 = `${dir}1`, field2 = `${dir}2`;
                            const elementConfig = getElementConfig(el);
                            const fields = [field1, field2];
                            if (typeof elementConfig.getUpdatedFields === "function") {
                                (elementConfig.getUpdatedFields(el) || []).forEach(f => fields.push(f));
                            }
                            // Assign the new values to the element
                            el[field1] = event.shiftKey ? snapshot[field1] + sign : getPosition(snapshot[field1] + sign * GRID_SIZE);
                            el[field2] = event.shiftKey ? snapshot[field2] + sign : getPosition(snapshot[field2] + sign * GRID_SIZE);
                            // Check for updating additional field on drag
                            if (typeof elementConfig.onDrag === "function") {
                                elementConfig.onDrag(el, snapshot, null);
                            }
                            // Return updated values
                            return {
                                id: el.id,
                                prevValues: Object.fromEntries(fields.map(field => {
                                    return [field, snapshot[field]];
                                })),
                                newValues: Object.fromEntries(fields.map(field => {
                                    return [field, el[field]];
                                })),
                            };
                        }),
                    });
                    dispatchChange();
                    update();
                }
            },

            // @description handle key up
            // onKeyUp: event => {},

            // @description handle element change
            onElementChange: (id, keys, values) => {
                if (activeElement?.id === id && activeElement?.editing) {
                    editor.updateElements([activeElement], keys, values, true);
                    dispatchChange();
                    update();
                }
            },

            // @description handle element blur
            onElementBlur: () => {
                editor.getElements().forEach(element => {
                    element.editing = false;
                });
                update();
            },

            // onWheel: event => {
            //     if (!isInputTarget(event)) {
            //         const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
            //         // CTRL KEY --> apply zooming
            //         if (isCtrlKey) {
            //             event.deltaY < 0 ? board.zoomIn() : board.zoomOut();
            //         }
            //         // NO CTRL_KEY --> apply translation
            //         else {
            //             board.translateX = board.translateX - event.deltaX;
            //             board.translateY = board.translateY - event.deltaY;
            //             board.update();
            //         }
            //     }
            // },

            // @description handle canvas resize
            onResize: event => {
                if (event?.canvasWidth && event?.canvasHeight) {
                    editor.setSize(event.canvasWidth, event.canvasHeight);
                    update();
                }
            },
            
            // @description handle context menu
            // onContextMenu: event => {
            //     // if ((!action || action === ACTIONS.SELECT || action === ACTIONS.TRANSLATE) && !tool) {
            //     if (editorState.tool === TOOLS.SELECT) {
            //         editorState.status = STATUS.IDLE;
            //         editorState.contextMenu = true;
            //         editorState.contextMenuTop = event.y;
            //         editorState.contextMenuLeft = event.x;
            //         update();
            //     }
            // },

            // @description handle paste event
            onPaste: event => {
                if (!isInputTarget(event) && !editor.page.readonly) {
                    editor.page.activeGroup = null;
                    editor.pasteElementsFromClipboard(event).then(() => {
                        dispatchChange();
                        update();
                    });
                }
            },
        };

        // Save reference to the editor
        editor.current = {
            update: update,
            state: editorState,
            dispatchChange: dispatchChange,
            dispatchLibraryChange: dispatchLibraryChange,
            events: editorEvents,
        };
    }

    // Return editor context
    return editor.current;
};
