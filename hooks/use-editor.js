import React from "react";
import {useUpdate} from "react-use";
import {
    ELEMENTS,
    HANDLERS,
    GRID_SIZE,
    IS_DARWIN,
    ACTIONS,
    CHANGES,
    KEYS,
    STATES,
    SNAP_THRESHOLD,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
} from "../lib/constants.js";
import {normalizeBounds, getRectangleBounds} from "../lib/utils/math.js";
import {isArrowKey} from "../lib/utils/keys.js";
import {isInputTarget} from "../lib/utils/events.js";
import {
    getElementConfig, 
    createElement,
    getElementsSnappingEdges,
    getElementSnappingPoints,
} from "../lib/elements.js";
import {useScene} from "../contexts/scene.jsx";

// @private create a new editor state
const createInitialEditorState = (props, scene) => {
    const isSceneEmpty = scene.pages.length === 1 && scene.page.elements.length === 0;
    const editorState = {
        currentState: STATES.IDLE,
        action: null,
        visibleSnapEdges: [],

        // @description active tool state
        tool: null,
        toolLocked: false,

        // @description current selection  
        selection: null,

        // @description context menu configuration
        contextMenu: false,
        contextMenuTop: 0,
        contextMenuLeft: 0,

        // @description export configuration
        exportRegion: null,

        // @description state for dialogs
        exportVisible: false,
        pagesVisible: false,

        // @description state for welcome items
        hintsVisible: props.showHints && isSceneEmpty,
        welcomeVisible: props.showWelcome && isSceneEmpty,
    };
    return editorState;
};

// @public use editor
export const useEditor = props => {
    const update = useUpdate();
    const scene = useScene();
    const editor = React.useRef(null);
    const onChangeRef = React.useRef(props?.onChange);

    // We need to update the reference to the onChange function
    onChangeRef.current = props?.onChange;

    // Initialize editor state
    if (!editor.current) {
        const editorState = createInitialEditorState(props, scene);

        // @description dispatch an editor change
        const dispatchChange = () => {
            return onChangeRef.current(scene.toJSON());
        };

        // @private get position based on the grid state
        const getPosition = (pos, edge = null, size = 0, includeCenter = false) => {
            // 1. Check if grid mode is enabled
            if (scene?.appState?.grid) {
                return Math.round(pos / GRID_SIZE) * GRID_SIZE;
            }
            // 2. check if snap mode is enabled
            if (edge && scene?.appState?.snapToElements) {
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
            const history = scene.getHistory();
            if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
                history.shift();
            }
            scene.removeElements([element]);
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
                if (editorState.action === ACTIONS.EDIT) {
                    if (activeElement?.editing) {
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                    }
                    activeElement.editing = false; // Disable editing
                    activeElement = null;
                    editorState.action = null;
                }
                // Check if we have an active group
                if (scene.page.activeGroup) {
                    scene.page.activeGroup = null;
                    update();
                }
                if (!editorState.tool) {
                    scene.clearSelection();
                    update();
                }
            },
            onPointElement: event => {
                if (!editorState.tool && !editorState.action) {
                    const element = scene.getElement(event.element);
                    isPrevSelected = element.selected;
                    // Check to reset active group
                    if (scene.page.activeGroup && element.group !== scene.page.activeGroup) {
                        scene.getElements().forEach(el => {
                            el.selected = el.group === scene.page.activeGroup || el.selected;
                        });
                        scene.page.activeGroup = null;
                    }
                    const inCurrentSelection = scene.getSelection().some(el => {
                        return el.id === element.id;
                    });
                    if (!inCurrentSelection && !event.shiftKey) {
                        scene.clearSelection();
                    }
                    element.selected = true;
                    if (!scene.page.activeGroup && element.group) {
                        scene.getElements().forEach(el => {
                            el.selected = el.selected || (el.group && el.group === element.group);
                        });
                    }
                    update();
                }
            },
            onPointHandler: () => {
                editorState.action = ACTIONS.RESIZE;
            },
            onPointerDown: event => {
                isDragged = false;
                isResized = false;
                const selectedElements = scene.getSelection();
                // First we need to check if we are in a edit action
                if (editorState.action === ACTIONS.EDIT) {
                    if (activeElement?.editing) {
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                    }
                    editorState.action = null;
                }
                if (editorState.tool) {
                    editorState.action = ACTIONS.CREATE;
                    const element = createElement(editorState.tool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.(scene.defaults) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
                        x2: getPosition(event.originalX),
                        y2: getPosition(event.originalY),
                        creating: true,
                    });
                    elementConfig.onCreateStart?.(element, event),
                    activeElement = element; // Save element reference
                    // state.activeGroup = null; // Reset current group
                    scene.clearSelection();
                    scene.addElements([element]);
                }
                else if (selectedElements.length > 0) {
                    if (!selectedElements.some(el => el.locked)) {
                        if (!editorState.action) {
                            editorState.action = ACTIONS.TRANSLATE;
                        }
                        // Save a snapshot of the current selection for calculating the correct element position
                        snapshot = scene.getSelection().map(el => ({...el}));
                        snapshotBounds = getRectangleBounds(snapshot);
                        // Check for calling the onResizeStart listener
                        if (editorState.action === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = scene.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeStart === "function") {
                                elementConfig.onResizeStart(element, snapshot[0], event);
                            }
                        }
                    }
                }
                else if (!editorState.action || editorState.action === ACTIONS.SELECT || editorState.action === ACTIONS.SCREENSHOT) {
                    editorState.action = editorState.action || ACTIONS.SELECT;
                    editorState.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    scene.clearSelection();
                }
                // We need to update the last translated point before start moving the board
                else if (editorState.action === ACTIONS.MOVE) {
                    lastTranslateX = scene.page.translateX;
                    lastTranslateY = scene.page.translateY;
                }
                // else if (editorState.action === ACTIONS.ERASE) {
                //     editorState.erase = {
                //         x: event.originalX,
                //         y: event.originalY,
                //     };
                // }
                editorState.currentState = STATES.POINTING;
                editorState.contextMenu = false;
                editorState.visibleSnapEdges = [];
                snapEdges = [];
                activeSnapEdges = [];
                if (editorState.action === ACTIONS.TRANSLATE || editorState.action === ACTIONS.RESIZE) {
                    if (scene?.appState?.snapToElements) {
                        snapEdges = getElementsSnappingEdges(scene.getElements());
                    }
                }
                update();
            },
            onPointerMove: event => {
                if (editorState.action === ACTIONS.MOVE) {
                    editorState.currentState = STATES.DRAGGING;
                    scene.page.translateX = Math.floor(lastTranslateX + event.dx * scene.page.zoom);
                    scene.page.translateY = Math.floor(lastTranslateY + event.dy * scene.page.zoom);
                }
                else if (editorState.action === ACTIONS.ERASE) {
                    editorState.currentState = STATES.ERASING;
                    const x = event.originalX + event.dx;
                    const y = event.originalY + event.dy;
                    scene.getElements().forEach(element => {
                        if (!element.erased) {
                            const b = element.type === ELEMENTS.ARROW ? normalizeBounds(element) : element;
                            if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                                element.erased = true;
                            }
                        }
                    });
                }
                else if (editorState.action === ACTIONS.CREATE) {
                    editorState.currentState = STATES.CREATING;
                    const element = activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (editorState.action === ACTIONS.TRANSLATE) {
                    editorState.visibleSnapEdges = [];
                    activeSnapEdges = [];
                    editorState.currentState = STATES.TRANSLATING;
                    isDragged = true;
                    const elements = scene.getSelection();
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
                    if (scene?.appState?.snapToElements && activeSnapEdges.length > 0) {
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
                else if (editorState.action === ACTIONS.RESIZE) {
                    editorState.visibleSnapEdges = [];
                    editorState.currentState = STATES.RESIZING;
                    activeSnapEdges = [];
                    isResized = true;
                    const element = scene.getElement(snapshot[0].id);
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
                    if (scene?.appState?.snapToElements && activeSnapEdges.length > 0) {
                        editorState.visibleSnapEdges = activeSnapEdges.map(snapEdge => ({
                            // ...snapEdge,
                            points: [
                                ...snapEdge.points,
                                ...getElementSnappingPoints(element, snapEdge),
                            ],
                        }));
                    }
                }
                else if (editorState.action === ACTIONS.SELECT || editorState.action === ACTIONS.SCREENSHOT) {
                    editorState.currentState = STATES.BRUSHING;
                    editorState.selection.x2 = event.currentX;
                    editorState.selection.y2 = event.currentY;
                }
                // Force editor update
                update();
            },

            // @description handle pointer up
            onPointerUp: event => {
                editorState.visibleSnapEdges = [];
                editorState.currentState = STATES.IDLE;
                if (editorState.action === ACTIONS.MOVE) {
                    lastTranslateX = scene.page.translateX;
                    lastTranslateY = scene.page.translateY;
                    return update();
                }
                else if (editorState.action === ACTIONS.ERASE) {
                    const erasedElements = scene.getErasedElements();
                    scene.removeElements(erasedElements);
                    dispatchChange();
                    return update();
                }
                else if (editorState.action === ACTIONS.CREATE && activeElement) {
                    const element = activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = scene.page.history[0] || {};
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
                        editorState.tool = null;
                    }
                    else {
                        // If tool is locked, we need to reset the current selection
                        element.selected = false;
                    }
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        activeElement = element;
                        editorState.action = ACTIONS.EDIT;
                        return update();
                    }
                }
                else if (editorState.action === ACTIONS.TRANSLATE || editorState.action === ACTIONS.RESIZE) {
                    if (isDragged || isResized) {
                        if (editorState.action === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = scene.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeEnd === "function") {
                                elementConfig.onResizeEnd(element, snapshot[0], event);
                            }
                        }
                        const selectedElements = scene.getSelection();
                        scene.addHistory({
                            type: CHANGES.UPDATE,
                            elements: selectedElements.map((element, index) => {
                                const updatedFields = new Set(["x1", "x2", "y1", "y2"]);
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
                        const element = scene.getElement(event.element);
                        if (!event.shiftKey) {
                            scene.clearSelection();
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !isPrevSelected;
                        }
                        // Select all elements of this group
                        if (element.group && !scene.page.activeGroup) {
                            scene.getElements().forEach(el => {
                                el.selected = el.group === element.group ? element.selected : el.selected;
                            });
                        }
                    }
                    isDragged = false;
                    isResized = false;
                }
                else if (editorState.action === ACTIONS.SELECT) {
                    const selection = editorState.selection;
                    scene.setSelection({
                        x1: Math.min(selection.x1, selection.x2),
                        x2: Math.max(selection.x1, selection.x2),
                        y1: Math.min(selection.y1, selection.y2),
                        y2: Math.max(selection.y1, selection.y2),
                    });
                }
                else if (editorState.action === ACTIONS.SCREENSHOT) {
                    editorState.exportVisible = true;
                    editorState.exportRegion = {...editorState.selection};
                }
                editorState.selection = null;
                editorState.action = null;
                update();
            },

            // @description double click 
            onDoubleClickElement: event => {
                if (!editorState.action && !editorState.tool) {
                    // board.clearSelectedElements();
                    const element = scene.getElement(event.element);
                    // Check for entering in group edition mode
                    if (!scene.page.activeGroup && element.group) {
                        scene.page.activeGroup = element.group;
                        scene.clearSelection();
                        element.selected = true; // Mark this element as selected
                    }
                    else if (element && !element.locked) {
                        activeElement = element;
                        activeElement.editing = true;
                        editorState.action = ACTIONS.EDIT;
                    }
                    update();
                }
            },
            
            // @description handle key down
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (editorState.action === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        if (activeElement?.editing) {
                            activeElement.editing = false; // Stopediting element
                            if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                                removeTextElement(activeElement);
                            }
                            // Force to reset the active element
                            activeElement = null;
                        }
                        editorState.action = null;
                        update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        scene.copyElementsToClipboard(scene.getSelection());
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        scene.removeSelection();
                        dispatchChange();
                    }
                    update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    // editor.setAction(null);
                    // sceneActions.clearSelection(editor.scene);
                    activeElement = null;
                    event.key === KEYS.Z ? scene.undo() : scene.redo();
                    dispatchChange();
                    update();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    if (editorState.action === ACTIONS.SCREENSHOT) {
                        editorState.action = null;
                    }
                    // Check for active group enabled --> exit group edition
                    // if (board.activeGroup) {
                    //     board.activeGroup = null;
                    // }
                    event.preventDefault();
                    scene.clearSelection();
                    update();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = scene.getSelection();
                    scene.addHistory({
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
                    scene.updateElements([activeElement], keys, values, true);
                    dispatchChange();
                    update();
                }
            },

            // @description handle element blur
            onElementBlur: () => {
                scene.getElements().forEach(element => {
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
                    scene.setSize(event.canvasWidth, event.canvasHeight);
                    update();
                }
            },
            
            // @description handle context menu
            onContextMenu: event => {
                const {action, tool} = editorState;
                if ((!action || action === ACTIONS.SELECT || action === ACTIONS.TRANSLATE) && !tool) {
                    editorState.currentState = STATES.IDLE;
                    editorState.action = null;
                    editorState.contextMenu = true;
                    editorState.contextMenuTop = event.y;
                    editorState.contextMenuLeft = event.x;
                    update();
                }
            },

            // @description handle paste event
            onPaste: event => {
                if (!isInputTarget(event)) {
                    scene.page.activeGroup = null;
                    scene.pasteElementsFromClipboard(event).then(() => {
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
            events: editorEvents,
        };
    }

    // Return editor context
    return editor.current;
};
