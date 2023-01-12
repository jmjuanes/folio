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

export const useEvents = callbacks => {
    const board = useBoard();
    const events = React.useRef(null);

    if (!events.current) {
        const getPosition = pos => {
            // return state.grid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
            return Math.round(pos / GRID_SIZE) * GRID_SIZE;
        };

        // Internal variables
        let snapshot = [];
        let isDragged = false, isResized = false, isPrevSelected = false;
        let lastTranslateX = 0, lastTranslateY = 0;

        events.current = {
            onPointCanvas: () => {
                if (board.activeAction === ACTIONS.EDIT) {
                    board.setAction(null);
                }
                if (!board.activeTool) {
                    board.clearSelectedElements();
                    board.update();
                }
            },
            onPointElement: event => {
                if (!board.activeTool && !board.activeAction) {
                    const element = board.getElement(event.element);
                    isPrevSelected = element.selected;
                    const inCurrentSelection = board.getSelectedElements().some(el => {
                        return el.id === element.id;
                    });
                    if (!inCurrentSelection && !event.shiftKey) {
                        board.clearSelectedElements();
                    }
                    element.selected = true;
                    board.update();
                }
            },
            onPointHandler: () => {
                board.activeAction = ACTIONS.RESIZE;
            },
            onPointerDown: event => {
                isDragged = false;
                isResized = false;
                // First we need to check if we are in a edit action
                if (board.activeAction === ACTIONS.EDIT) {
                    board.setAction(null);
                }
                if (board.activeTool) {
                    board.activeAction = ACTIONS.CREATE;
                    const element = board.createElement(board.activeTool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.(board.defaults) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
                        x2: getPosition(event.originalX),
                        y2: getPosition(event.originalY),
                        creating: true,
                    });
                    elementConfig.onCreateStart?.(element, event),
                    board.activeElement = element; // Save element reference
                    // state.activeGroup = null; // Reset current group
                    board.clearSelectedElements();
                    board.addElements([element]);
                }
                else if (board.getSelectedElements().length > 0) {
                    if (!board.activeAction) {
                        board.activeAction = ACTIONS.DRAG;
                    }
                    // Save a snapshot of the current selection for calculating the correct element position
                    snapshot = board.snapshotSelectedElements();
                }
                else if ((
                    !board.activeAction ||
                    board.activeAction === ACTIONS.SELECT ||
                    board.activeAction === ACTIONS.SCREENSHOT
                )) {
                    board.activeAction = board.activeAction || ACTIONS.SELECT;
                    board.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    board.clearSelectedElements();
                }
                // We need to update the last translated point before start moving the board
                else if (board.activeAction === ACTIONS.MOVE) {
                    lastTranslateX = board.translateX;
                    lastTranslateY = board.translateY;
                }
                board.update();
            },
            onPointerMove: event => {
                if (board.activeAction === ACTIONS.MOVE) {
                    board.translateX = Math.floor(lastTranslateX + event.dx * board.zoom);
                    board.translateY = Math.floor(lastTranslateY + event.dy * board.zoom);
                }
                else if (board.activeAction === ACTIONS.CREATE) {
                    const element = board.activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (board.activeAction === ACTIONS.DRAG) {
                    isDragged = true;
                    board.getSelectedElements().forEach((element, index) => {
                        element.x1 = getPosition(snapshot[index].x1 + event.dx);
                        element.x2 = getPosition(snapshot[index].x2 + event.dx);
                        element.y1 = getPosition(snapshot[index].y1 + event.dy);
                        element.y2 = getPosition(snapshot[index].y2 + event.dy);
                        // getElementConfig(element)?.onDrag?.(snapshot[index], event);
                    });
                }
                else if (board.activeAction === ACTIONS.RESIZE) {
                    isResized = true;
                    const element = board.getElement(snapshot[0].id);
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
                else if (board.activeAction === ACTIONS.SELECT || board.activeAction === ACTIONS.SCREENSHOT) {
                    board.selection.x2 = event.currentX;
                    board.selection.y2 = event.currentY;
                }
                // board.update();
                board.update();
            },
            onPointerUp: event => {
                if (board.activeAction === ACTIONS.MOVE) {
                    lastTranslateX = board.translateX;
                    lastTranslateY = board.translateY;
                    return board.update();
                }
                else if (board.activeAction === ACTIONS.CREATE && board.activeElement) {
                    const element = board.activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = board.history[0] || {};
                    if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                        last.elements[0].newValues = {
                            ...element,
                            selected: false,
                        };
                    }
                    // Call the element created listener
                    // callbacks?.onElementCreated?.(element);
                    board.activeElement = null;
                    board.activeTool = null; // reset active tool
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        board.activeElement = element;
                        board.activeAction = ACTIONS.EDIT;
                        return board.update();
                    }
                }
                else if (board.activeAction === ACTIONS.DRAG || board.activeAction === ACTIONS.RESIZE) {
                    if (isDragged || isResized) {
                        const keys = ["x1", "x2", "y1", "y2"];
                        board.addHistory({
                            type: CHANGES.UPDATE,
                            elements: board.getSelectedElements().map((element, index) => ({
                                id: element.id,
                                prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                            })),
                        });
                    }
                    else if (event.element) {
                        const element = board.getElement(event.element);
                        if (!event.shiftKey) {
                            board.clearSelectedElements();
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !isPrevSelected;
                        }
                    }
                    isDragged = false;
                    isResized = false;
                }
                else if (board.activeAction === ACTIONS.SELECT) {
                    const selection = board.selection;
                    board.setSelectedElements({
                        x1: Math.min(selection.x1, selection.x2),
                        x2: Math.max(selection.x1, selection.x2),
                        y1: Math.min(selection.y1, selection.y2),
                        y2: Math.max(selection.y1, selection.y2),
                    });
                }
                else if (board.activeAction === ACTIONS.SCREENSHOT) {
                    // const screenshotRegion = {
                    //     x: Math.min(state.selection.x1, state.selection.x2),
                    //     y: Math.min(state.selection.y1, state.selection.y2),
                    //     width: Math.abs(state.selection.x2 - state.selection.x1),
                    //     height: Math.abs(state.selection.y2 - state.selection.y1),
                    // };
                    callbacks?.onScreenshot?.({...board.selection});
                }
                board.activeAction = null;
                board.selection = null;
                board.update();
            },
            onDoubleClickElement: event => {
                if (!board.activeAction && !board.activeTool) {
                    board.clearSelectedElements();
                    const element = board.getElement(event.element);
                    // TODO: we need to check if this element is editable
                    board.activeElement = element;
                    board.activeElement.editing = true;
                    board.activeAction = ACTIONS.EDIT;
                    board.update();
                }
            },
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (board.activeAction === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        board.setAction(null);
                        board.activeElement = null;
                        board.update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        const data = `folio:::${JSON.stringify(board.copy())}`;
                        copyTextToClipboard(data).then(() => {
                            // console.log("Copied to clipboard");
                        });
                        // If clipboard is not available
                        // return Promise.reject(new Error("Clipboard not available"));
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        board.removeSelectedElements();
                        // if (board.getElementsInActiveGroup().length === 0) {
                        //     // Reset active group if all elements of this group have been removed
                        //     state.activeGroup = null;
                        // }
                    }
                    board.update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    board.setAction(null);
                    board.activeElement = null;
                    event.key === KEYS.Z ? board.undo() : board.redo();
                    board.update();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    if (board.activeAction === ACTIONS.SCREENSHOT) {
                        board.activeAction = null;
                    }
                    event.preventDefault();
                    board.clearSelectedElements();
                    board.update();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = board.getSelectedElements();
                    board.addHistory({
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
                    // board.update();
                    board.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (isInputTarget(event)) {
                    return null;
                }
                board.clearSelectedElements();
                // state.activeGroup = null;
                return getDataFromClipboard(event).then(data => {
                    if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                        const newData = JSON.parse(data.content.split("folio:::")[1].trim());
                        board.paste(newData || {});
                        board.update();
                    }
                    // Create a new text element
                    else if (data?.type === "text") {
                        board.addText(data.content);
                    }
                    // Create a new image element
                    else if (data?.type === "image") {
                        board.addImage(data.content);
                    }
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, keys, values) => {
                if (board.activeElement?.id === id && board.activeElement?.editing) {
                    board.updateElements([board.activeElement], keys, values, true);
                    board.update();
                }
            },
        };
    }

    return events.current;
};
