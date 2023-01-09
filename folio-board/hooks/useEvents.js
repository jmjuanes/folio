import React from "react";
import {
    ELEMENTS,
    HANDLERS,
    GRID_SIZE,
    getElementConfig,
} from "folio-core";
import {
    IS_DARWIN,
    ACTIONS,
    CHANGES,
    KEYS,
} from "../constants.js";
import {isInputTarget} from "../utils/events.js";
import {getDataFromClipboard, copyTextToClipboard} from "../utils/clipboard.js";
import {isArrowKey} from "../utils/keys.js";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useEvents = () => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = useBoard();
    const internalState = React.useRef({
        isPrevSelected: false,
        lastTranslateX: 0,
        lastTranslateY: 0,
        isDragged: false,
        isResized: false,
        snapshot: [],
    });
    const events = React.useRef(null);

    if (!events.current) {
        events.current = {
            onPointCanvas: () => {
                if (state.current.activeAction === ACTIONS.EDIT) {
                    board.current.setAction(null);
                }
                if (!state.current.activeTool) {
                    board.current.clearSelectedElements();
                    forceUpdate();
                }
            },
            onPointElement: event => {
                if (!state.current.activeTool && !state.current.activeAction) {
                    const element = board.current.getElement(event.element);
                    internalState.current.isPrevSelected = element.selected;
                    const inCurrentSelection = board.current.getSelectedElements().some(el => {
                        return el.id === element.id;
                    });
                    if (!inCurrentSelection && !event.shiftKey) {
                        board.current.clearSelectedElements();
                    }
                    element.selected = true;
                    forceUpdate();
                }
            },
            onPointHandler: () => {
                state.current.activeAction = ACTIONS.RESIZE;
                // board.current.state.activeHandler = event.handler;
            },
            onPointerDown: event => {
                internalState.current.isDragged = false;
                internalState.current.isResized = false;
                // First we need to check if we are in a edit action
                if (state.current.activeAction === ACTIONS.EDIT) {
                    board.current.setAction(null);
                }
                if (state.current.activeTool) {
                    state.current.activeAction = ACTIONS.CREATE;
                    const element = board.current.createElement(board.current.tool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.(state.style) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
                        x2: getPosition(event.originalX),
                        y2: getPosition(event.originalY),
                        creating: true,
                    });
                    elementConfig.onCreateStart?.(element, event),
                    state.current.activeElement = element; // Save element reference
                    // state.activeGroup = null; // Reset current group
                    board.current.clearSelectedElements();
                    board.current.addElements([element]);
                }
                else if (board.current.getSelectedElements().length > 0) {
                    if (!state.current.activeAction) {
                        state.current.activeAction = ACTIONS.DRAG;
                    }
                    // Save a snapshot of the current selection for calculating the correct element position
                    internalState.current.snapshot = board.current.snapshotSelectedElements();
                }
                else if ((
                    !state.current.activeAction ||
                    state.current.activeAction === ACTIONS.SELECT ||
                    state.current.activeAction === ACTIONS.SCREENSHOT
                )) {
                    state.current.activeAction = state.current.activeAction || ACTIONS.SELECT;
                    board.current.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    board.current.clearSelectedElements();
                }
                else if (state.current.activeAction === ACTIONS.MOVE) {
                    // We need to update the last translated point before start moving the board
                    internalState.current.lastTranslateX = board.current.translateX;
                    internalState.current.lastTranslateY = board.current.translateY;
                }
                forceUpdate();
            },
            onPointerMove: event => {
                if (state.current.activeAction === ACTIONS.MOVE) {
                    board.current.translateX = Math.floor(internalState.current.lastTranslateX + event.dx * board.current.zoom);
                    board.current.translateY = Math.floor(internalState.current.lastTranslateY + event.dy * board.current.zoom);
                }
                else if (state.current.activeAction === ACTIONS.CREATE) {
                    const element = state.current.activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (state.current.activeAction === ACTIONS.DRAG) {
                    const snapshot = internalState.current.snapshot;
                    internalState.current.isDragged = true;
                    board.current.getSelectedElements().forEach((element, index) => {
                        element.x1 = getPosition(snapshot[index].x1 + event.dx);
                        element.x2 = getPosition(snapshot[index].x2 + event.dx);
                        element.y1 = getPosition(snapshot[index].y1 + event.dy);
                        element.y2 = getPosition(snapshot[index].y2 + event.dy);
                        // getElementConfig(element)?.onDrag?.(snapshot[index], event);
                    });
                }
                else if (state.current.activeAction === ACTIONS.RESIZE) {
                    const snapshot = internalState.current.snapshot;
                    internalState.current.isResized = true;
                    const element = board.current.getElement(snapshot[0].id);
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - element.minWidth);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - element.minHeight);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + element.minWidth);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - element.minHeight);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - element.minWidth);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + element.minHeight);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + element.minWidth);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + element.minHeight);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - element.minHeight);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + element.minHeight);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - element.minWidth);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + element.minWidth);
                    }
                    else if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = getPosition(snapshot[0].x1 + event.dx);
                        element.y1 = getPosition(snapshot[0].y1 + event.dy);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = getPosition(snapshot[0].x2 + event.dx);
                        element.y2 = getPosition(snapshot[0].y2 + event.dy);
                    }
                }
                else if (state.current.activeAction === ACTIONS.SELECT || state.current.activeAction === ACTIONS.SCREENSHOT) {
                    board.current.selection.x2 = event.currentX;
                    board.current.selection.y2 = event.currentY;
                }
                // board.current.update();
                forceUpdate();
            },
            onPointerUp: event => {
                if (state.current.activeAction === ACTIONS.MOVE) {
                    internalState.current.lastTranslateX = board.current.translateX;
                    internalState.current.lastTranslateY = board.current.translateY;
                    // Prevent reset of activeAction
                    // return board.current.update();
                    forceUpdate();
                }
                else if (state.current.activeAction === ACTIONS.CREATE && state.current.activeElement) {
                    const element = state.current.activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = board.current.history[0] || {};
                    if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                        last.elements[0].newValues = {
                            ...element,
                            selected: false,
                        };
                    }
                    // Call the element created listener
                    // callbacks?.onElementCreated?.(element);
                    state.current.activeElement = null;
                    state.current.activeTool = null; // reset active tool
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        // state.current.activeElement = element;
                        state.current.activeAction = ACTIONS.EDIT;
                        // return board.current.update();
                        return forceUpdate();
                    }
                }
                else if (state.current.activeAction === ACTIONS.DRAG || state.current.activeAction === ACTIONS.RESIZE) {
                    if (internalState.current.isDragged || internalState.current.isResized) {
                        const snapshot = internalState.current.snapshot;
                        const keys = ["x1", "x2", "y1", "y2"];
                        board.current.addHistory({
                            type: CHANGES.UPDATE,
                            elements: board.current.getSelectedElements().map((element, index) => ({
                                id: element.id,
                                prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                            })),
                        });
                    }
                    else if (event.element) {
                        const element = board.current.getElement(event.element);
                        if (!event.shiftKey) {
                            board.current.clearSelectedElements();
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !state.isPrevSelected;
                        }
                    }
                    internalState.current.isDragged = false;
                    internalState.current.isResized = false;
                }
                else if (state.current.activeAction === ACTIONS.SELECT) {
                    const selection = board.current.selection;
                    board.current.setSelectedElements({
                        x1: Math.min(selection.x1, selection.x2),
                        x2: Math.max(selection.x1, selection.x2),
                        y1: Math.min(selection.y1, selection.y2),
                        y2: Math.max(selection.y1, selection.y2),
                    });
                }
                else if (state.current.activeAction === ACTIONS.SCREENSHOT) {
                    // const screenshotRegion = {
                    //     x: Math.min(state.selection.x1, state.selection.x2),
                    //     y: Math.min(state.selection.y1, state.selection.y2),
                    //     width: Math.abs(state.selection.x2 - state.selection.x1),
                    //     height: Math.abs(state.selection.y2 - state.selection.y1),
                    // };
                    // TODO
                    callbacks?.onScreenshot?.({...state.selection});
                }
                state.current.activeAction = null;
                board.current.selection = null;
                // board.current.update();
                forceUpdate();
            },
            onDoubleClickElement: event => {
                if (!state.current.activeAction && !state.current.activeTool) {
                    board.current.clearSelectedElements();
                    const element = board.current.getElement(event.element);
                    // TODO: we need to check if this element is editable
                    state.current.activeElement = element;
                    state.current.activeElement.editing = true;
                    state.current.activeAction = ACTIONS.EDIT;
                    // board.current.update();
                    forceUpdate();
                }
            },
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (state.current.activeAction === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        if (state.current.activeElement?.editing) {
                            state.current.activeElement.editing = false;
                        }
                        state.current.activeElement = null;
                        state.current.activeAction = null;
                        forceUpdate();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        const data = `folio:::${JSON.stringify(board.current.copy())}`;
                        copyTextToClipboard(data).then(() => {
                            // console.log("Copied to clipboard");
                        });
                        // If clipboard is not available
                        // return Promise.reject(new Error("Clipboard not available"));
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        board.current.removeSelectedElements();
                        // if (board.current.getElementsInActiveGroup().length === 0) {
                        //     // Reset active group if all elements of this group have been removed
                        //     state.activeGroup = null;
                        // }
                    }
                    forceUpdate();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    if (state.current.activeElement?.editing) {
                        state.current.activeElement.editing = false;
                    }
                    state.current.activeAction = null;
                    state.current.activeElement = null;
                    event.key === KEYS.Z ? board.current.undo() : board.current.redo();
                    forceUpdate();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    if (state.current.activeAction === ACTIONS.SCREENSHOT) {
                        state.current.activeAction = null;
                    }
                    else if (state.current.showExport || state.current.showMenu) {
                        state.current.showExport = false;
                        state.current.showMenu = false;
                    }
                    event.preventDefault();
                    board.current.clearSelectedElements();
                    // state.activeGroup = null;
                    forceUpdate();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = board.current.getSelectedElements();
                    board.current.addHistory({
                        type: CHANGES.UPDATE,
                        ids: selectedElements.map(el => el.id).join(","),
                        keys: `${dir}1,${dir}2`,
                        elements: selectedElements.map(el => {
                            const prev1 = el[`${dir}1`];
                            const prev2 = el[`${dir}2`];
                            el[`${dir}1`] = event.shiftKey ? getPosition(prev1 + sign * GRID_SIZE) : prev1 + sign;
                            el[`${dir}2`] = event.shiftKey ? getPosition(prev2 + sign * GRID_SIZE) : prev2 + sign;
                            return {
                                id: el.id,
                                prevValues: {
                                    [`${dir}1`]: prev1,
                                    [`${dir}2`]: prev2,
                                },
                                newValues: {
                                    [`${dir}1`]: el[`${dir}1`],
                                    [`${dir}2`]: el[`${dir}2`],
                                },
                            };
                        }),
                    });
                    // board.current.update();
                    forceUpdate();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (isInputTarget(event)) {
                    return null;
                }
                board.current.clearSelectedElements();
                // state.activeGroup = null;
                return getDataFromClipboard(event).then(data => {
                    // Paste elements
                    if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                        const newData = JSON.parse(data.content.split("folio:::")[1].trim());
                        board.current.paste(newData || {});
                        forceUpdate();
                    }
                    // Create a new text element
                    else if (data?.type === "text") {
                        board.current.addText(data.content).then(() => {
                            forceUpdate();
                        });
                    }
                    // Create a new image element
                    else if (data?.type === "image") {
                        board.current.addImage(data.content).then(() => {
                            forceUpdate();
                        });
                    }
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, keys, values) => {
                if (state.current.activeElement?.id === id && state.current.activeElement?.editing) {
                    board.current.updateElements([state.current.activeElement], keys, values, true);
                    forceUpdate();
                }
            },
        };
    }

    return events.current;
};
