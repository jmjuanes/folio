import React from "react";
import {
    ELEMENTS,
    HANDLERS,
    GRID_SIZE,
    IS_DARWIN,
    ACTIONS,
    CHANGES,
    KEYS,
    STATES,
} from "@lib/constants.js";
import {normalizeBounds} from "@lib/utils/math.js";
import {isInputTarget} from "@lib/utils/events.js";
import {isArrowKey} from "@lib/utils/keys.js";
import {getElementConfig} from "@elements/index.jsx";
import {useBoard} from "@components/contexts/board.jsx";

export const useEvents = callbacks => {
    const board = useBoard();
    const events = React.useRef(null);

    if (!events.current) {
        const getPosition = pos => {
            return board.grid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
        };

        // Remove the current text element
        const removeTextElement = element => {
            // Check if this element has been just created
            if (board.history[0]?.type === CHANGES.CREATE && board.history[0]?.elements?.[0]?.id === element.id) {
                // Just remove this history entry and filter elements
                board.history.shift();
                board.elements = board.elements.filter(el => el.id !== element.id);
            }
            else {
                // Just register an element remove action 
                board.removeElements([element]);
            }
            callbacks?.onChange?.({
                elements: board.elements,
            });
        };

        // Internal variables
        let snapshot = [];
        let isDragged = false, isResized = false, isPrevSelected = false;
        let lastTranslateX = 0, lastTranslateY = 0;

        events.current = {
            onPointCanvas: () => {
                if (board.activeAction === ACTIONS.EDIT) {
                    if (board.activeElement?.editing) {
                        if (board.activeElement.type === ELEMENTS.TEXT && !board.activeElement.text) {
                            removeTextElement(board.activeElement);
                        }
                    }
                    board.setAction(null);
                }
                if (board.activeGroup) {
                    board.activeGroup = null;
                    board.update();
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
                    // Check to reset active group
                    if (board.activeGroup && element.group !== board.activeGroup) {
                        board.elements.forEach(el => {
                            el.selected = el.group === board.activeGroup || el.selected;
                        });
                        board.activeGroup = null;
                    }
                    const inCurrentSelection = board.getSelectedElements().some(el => {
                        return el.id === element.id;
                    });
                    if (!inCurrentSelection && !event.shiftKey) {
                        board.clearSelectedElements();
                    }
                    element.selected = true;
                    if (!board.activeGroup && element.group) {
                        board.elements.forEach(el => {
                            el.selected = el.selected || (el.group && el.group === element.group);
                        });
                    }
                    board.update();
                }
            },
            onPointHandler: () => {
                board.activeAction = ACTIONS.RESIZE;
            },
            onPointerDown: event => {
                isDragged = false;
                isResized = false;
                const selectedElements = board.getSelectedElements();
                // First we need to check if we are in a edit action
                if (board.activeAction === ACTIONS.EDIT) {
                    if (board.activeElement?.editing) {
                        if (board.activeElement.type === ELEMENTS.TEXT && !board.activeElement.text) {
                            removeTextElement(board.activeElement);
                        }
                    }
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
                else if (selectedElements.length > 0) {
                    if (!selectedElements.some(el => el.locked)) {
                        if (!board.activeAction) {
                            board.activeAction = ACTIONS.TRANSLATE;
                        }
                        // Save a snapshot of the current selection for calculating the correct element position
                        snapshot = board.snapshotSelectedElements();
                        // Check for calling the onResizeStart listener
                        if (board.activeAction === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = board.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeStart === "function") {
                                elementConfig.onResizeStart(element, snapshot[0], event);
                            }
                        }
                    }
                }
                else if (!board.activeAction || board.activeAction === ACTIONS.SELECT || board.activeAction === ACTIONS.SCREENSHOT) {
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
                else if (board.activeAction === ACTIONS.ERASE) {
                    board.erase = {
                        x: event.originalX,
                        y: event.originalY,
                    };
                }
                board.currentState = STATES.POINTING;
                board.state.contextMenuVisible = false;
                board.update();
            },
            onPointerMove: event => {
                if (board.activeAction === ACTIONS.MOVE) {
                    board.currentState = STATES.DRAGGING;
                    board.translateX = Math.floor(lastTranslateX + event.dx * board.zoom);
                    board.translateY = Math.floor(lastTranslateY + event.dy * board.zoom);
                }
                else if (board.activeAction === ACTIONS.ERASE) {
                    board.currentState = STATES.ERASING;
                    board.erase.x = event.originalX + event.dx;
                    board.erase.y = event.originalY + event.dy;
                    board.elements.forEach(el => {
                        if (!el.erased) {
                            const b = el.type === ELEMENTS.ARROW ? normalizeBounds(el) : el;
                            if (b.x1 <= board.erase.x && board.erase.x <= b.x2) {
                                if (b.y1 <= board.erase.y && board.erase.y <= b.y2) {
                                    el.erased = true;
                                }
                            }
                        }
                    });
                }
                else if (board.activeAction === ACTIONS.CREATE) {
                    board.currentState = STATES.CREATING;
                    const element = board.activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (board.activeAction === ACTIONS.TRANSLATE) {
                    board.currentState = STATES.TRANSLATING;
                    isDragged = true;
                    board.getSelectedElements().forEach((element, index) => {
                        element.x1 = getPosition(snapshot[index].x1 + event.dx);
                        element.y1 = getPosition(snapshot[index].y1 + event.dy);
                        element.x2 = element.x1 + (snapshot[index].x2 - snapshot[index].x1);
                        element.y2 = element.y1 + (snapshot[index].y2 - snapshot[index].y1);
                        // Execute the onDrag function
                        getElementConfig(element)?.onDrag?.(element, snapshot[index], event);
                    });
                }
                else if (board.activeAction === ACTIONS.RESIZE) {
                    board.currentState = STATES.RESIZING;
                    isResized = true;
                    const element = board.getElement(snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1);
                    }
                    else if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = getPosition(snapshot[0].x1 + event.dx);
                        element.y1 = getPosition(snapshot[0].y1 + event.dy);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = getPosition(snapshot[0].x2 + event.dx);
                        element.y2 = getPosition(snapshot[0].y2 + event.dy);
                    }
                    // Execute onResize handler
                    elementConfig?.onResize?.(element, snapshot[0], event, getPosition);
                }
                else if (board.activeAction === ACTIONS.SELECT || board.activeAction === ACTIONS.SCREENSHOT) {
                    board.currentState = STATES.BRUSHING;
                    board.selection.x2 = event.currentX;
                    board.selection.y2 = event.currentY;
                }
                // board.update();
                board.update();
            },
            onPointerUp: event => {
                board.currentState = STATES.IDLE;
                if (board.activeAction === ACTIONS.MOVE) {
                    lastTranslateX = board.translateX;
                    lastTranslateY = board.translateY;
                    // callbacks?.onChange?.({
                    //     translateX: board.translateX,
                    //     translateY: board.translateY,
                    // });
                    return board.update();
                }
                else if (board.activeAction === ACTIONS.ERASE) {
                    board.erase = null;
                    board.removeElements(board.elements.filter(el => el.erased));
                    callbacks?.onChange?.({
                        elements: board.elements,
                    });
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
                    callbacks?.onChange?.({
                        elements: board.elements,
                    });
                    board.activeElement = null;
                    // Check if the tool is not the handdraw
                    // TODO: we need also to check if lock is enabled
                    if (!board.lockTool && board.activeTool !== ELEMENTS.DRAW) {
                        board.activeTool = null;
                    }
                    else {
                        // If tool is locked, we need to reset the current selection
                        element.selected = false;
                    }
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        board.activeElement = element;
                        board.activeAction = ACTIONS.EDIT;
                        return board.update();
                    }
                }
                else if (board.activeAction === ACTIONS.TRANSLATE || board.activeAction === ACTIONS.RESIZE) {
                    if (isDragged || isResized) {
                        if (board.activeAction === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = board.getElement(snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeEnd === "function") {
                                elementConfig.onResizeEnd(element, snapshot[0], event);
                            }
                        }
                        board.addHistory({
                            type: CHANGES.UPDATE,
                            elements: board.getSelectedElements().map((element, index) => {
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
                        callbacks?.onChange?.({
                            elements: board.elements,
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
                        // Select all elements of this group
                        if (element.group && !board.activeGroup) {
                            board.elements.forEach(el => {
                                el.selected = el.group === element.group ? element.selected : el.selected;
                            });
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
                    callbacks?.onScreenshot?.({...board.selection});
                }
                board.activeAction = null;
                board.selection = null;
                board.update();
            },
            onDoubleClickElement: event => {
                if (!board.activeAction && !board.activeTool) {
                    // board.clearSelectedElements();
                    const element = board.getElement(event.element);
                    // if (!board.activeGroup && element.group) {
                    //     board.activeGroup = element.group;
                    //     board.clearSelectedElements();
                    //     element.selected = true; // Mark this element as selected
                    // }
                    if (element && !element.locked) {
                        board.activeElement = element;
                        board.activeElement.editing = true;
                        board.activeAction = ACTIONS.EDIT;
                    }
                    board.update();
                }
            },
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (board.activeAction === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        if (board.activeElement?.editing) {
                            if (board.activeElement.type === ELEMENTS.TEXT && !board.activeElement.text) {
                                removeTextElement(board.activeElement);
                            }
                        }
                        board.setAction(null);
                        board.update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        board.copy();
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        board.removeSelectedElements();
                        callbacks?.onChange?.({
                            elements: board.elements,
                            assets: board.assets,
                        });
                    }
                    board.update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    board.setAction(null);
                    board.clearSelectedElements();
                    board.activeElement = null;
                    event.key === KEYS.Z ? board.undo() : board.redo();
                    callbacks?.onChange?.({
                        elements: board.elements,
                        assets: board.assets,
                    });
                    board.update();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    if (board.activeAction === ACTIONS.SCREENSHOT) {
                        board.activeAction = null;
                    }
                    // Check for active group enabled --> exit group edition
                    // if (board.activeGroup) {
                    //     board.activeGroup = null;
                    // }
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
                            el[`${dir}1`] = event.shiftKey ? prev1 + sign : getPosition(prev1 + sign * GRID_SIZE);
                            el[`${dir}2`] = event.shiftKey ? prev2 + sign : getPosition(prev2 + sign * GRID_SIZE);
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
                    callbacks?.onChange?.({
                        elements: board.elements,
                    });
                    board.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (isInputTarget(event)) {
                    return null;
                }
                board.clearSelectedElements();
                board.activeGroup = null;
                board.state.contextMenuVisible = false;
                board.paste(event).then(() => {
                    return callbacks?.onChange?.({
                        elements: board.elements,
                        assets: board.assets,
                    });
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, keys, values) => {
                if (board.activeElement?.id === id && board.activeElement?.editing) {
                    board.updateElements([board.activeElement], keys, values, true);
                    callbacks?.onChange?.({
                        elements: board.elements,
                    });
                    board.update();
                }
            },
            onContextMenu: event => {
                if ((!board.activeAction || board.activeAction === ACTIONS.SELECT || board.activeAction === ACTIONS.TRANSLATE) && !board.activeTool) {
                    board.currentState = STATES.IDLE;
                    board.activeAction = null;
                    board.state.contextMenuVisible = true;
                    board.state.contextMenuX = event.x;
                    board.state.contextMenuY = event.y;
                    board.update();
                }
            },
            onWheel: event => {
                if (!isInputTarget(event)) {
                    const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                    // CTRL KEY --> apply zooming
                    if (isCtrlKey) {
                        event.deltaY < 0 ? board.zoomIn() : board.zoomOut();
                    }
                    // NO CTRL_KEY --> apply translation
                    else {
                        board.translateX = board.translateX - event.deltaX;
                        board.translateY = board.translateY - event.deltaY;
                        board.update();
                    }
                }
            },
            onResize: event => {
                if (event?.canvasWidth && event?.canvasHeight) {
                    board.state.canvasWidth = event.canvasWidth;
                    board.state.canvasHeight = event.canvasHeight;
                }
            },
        };
    }

    return events.current;
};
