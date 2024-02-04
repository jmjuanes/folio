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
import {getElementConfig} from "@lib/elements.js";
import {sceneActions} from "@lib/scene.js";

export const useEvents = (scene, editor, callbacks) => {
    const events = React.useRef(null);

    if (!events.current) {
        const getPosition = pos => {
            return editor.state.grid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
        };

        // Remove the current text element
        const removeTextElement = element => {
            // Check if this element has been just created
            if (scene.history[0]?.type === CHANGES.CREATE && scene.history[0]?.elements?.[0]?.id === element.id) {
                // Just remove this history entry and filter elements
                scene.history.shift();
                scene.elements = scene.elements.filter(el => el.id !== element.id);
            }
            else {
                // Just register an element remove action 
                sceneActions.removeElements(scene, [element]);
            }
            callbacks?.onChange?.({
                elements: scene.elements,
            });
        };

        // Internal variables
        let snapshot = [];
        let activeElement = null;
        let isDragged = false, isResized = false, isPrevSelected = false;
        let lastTranslateX = 0, lastTranslateY = 0;

        events.current = {
            onPointCanvas: () => {
                if (editor.state.action === ACTIONS.EDIT) {
                    if (activeElement?.editing) {
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                    }
                    activeElement = null;
                    editor.actions.setAction(null);
                }
                if (!editor.state.tool) {
                    sceneActions.clearSelection(scene);
                    editor.update();
                }
            },
            onPointElement: event => {
                if (!editor.state.tool && !editor.state.action) {
                    const element = sceneActions.getElement(scene, event.element);
                    isPrevSelected = element.selected;
                    // Check to reset active group
                    // if (board.activeGroup && element.group !== board.activeGroup) {
                    //     board.elements.forEach(el => {
                    //         el.selected = el.group === board.activeGroup || el.selected;
                    //     });
                    //     board.activeGroup = null;
                    // }
                    const inCurrentSelection = sceneActions
                        .getSelection(scene)
                        .some(el => el.id === element.id);
                    if (!inCurrentSelection && !event.shiftKey) {
                        sceneActions.clearSelection(scene);
                    }
                    element.selected = true;
                    // if (!board.activeGroup && element.group) {
                    //     board.elements.forEach(el => {
                    //         el.selected = el.selected || (el.group && el.group === element.group);
                    //     });
                    // }
                    editor.update();
                }
            },
            onPointHandler: () => {
                editor.state.action = ACTIONS.RESIZE;
            },
            onPointerDown: event => {
                isDragged = false;
                isResized = false;
                const selectedElements = sceneActions.getSelection(scene);
                // First we need to check if we are in a edit action
                if (editor.state.action === ACTIONS.EDIT) {
                    if (activeElement?.editing) {
                        if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                            removeTextElement(activeElement);
                        }
                    }
                    editor.actions.setAction(null);
                }
                if (editor.state.tool) {
                    editor.state.action = ACTIONS.CREATE;
                    const element = sceneActions.createElement(scene, editor.state.tool);
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
                    sceneActions.clearSelection(scene);
                    sceneActions.addElements(scene, [element]);
                }
                else if (selectedElements.length > 0) {
                    if (!selectedElements.some(el => el.locked)) {
                        if (!editor.state.action) {
                            editor.state.action = ACTIONS.TRANSLATE;
                        }
                        // Save a snapshot of the current selection for calculating the correct element position
                        snapshot = sceneActions.snapshotSelection(scene);
                        // Check for calling the onResizeStart listener
                        if (editor.state.action === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = sceneActions.getElement(scene, snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeStart === "function") {
                                elementConfig.onResizeStart(element, snapshot[0], event);
                            }
                        }
                    }
                }
                else if (!editor.state.action || editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT) {
                    editor.state.action = editor.state.action || ACTIONS.SELECT;
                    editor.state.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    sceneActions.clearSelection(scene);
                }
                // We need to update the last translated point before start moving the board
                else if (editor.state.action === ACTIONS.MOVE) {
                    lastTranslateX = scene.state.translateX;
                    lastTranslateY = scene.state.translateY;
                }
                // else if (editor.state.action === ACTIONS.ERASE) {
                //     editor.state.erase = {
                //         x: event.originalX,
                //         y: event.originalY,
                //     };
                // }
                editor.state.current = STATES.POINTING;
                editor.state.contextMenu = false;
                editor.update();
            },
            onPointerMove: event => {
                if (editor.state.action === ACTIONS.MOVE) {
                    editor.state.current = STATES.DRAGGING;
                    scene.state.translateX = Math.floor(lastTranslateX + event.dx * scene.state.zoom);
                    scene.state.translateY = Math.floor(lastTranslateY + event.dy * scene.state.zoom);
                }
                else if (editor.state.action === ACTIONS.ERASE) {
                    editor.state.current = STATES.ERASING;
                    const x = event.originalX + event.dx;
                    const y = event.originalY + event.dy;
                    scene.elements.forEach(element => {
                        if (!element.erased) {
                            const b = element.type === ELEMENTS.ARROW ? normalizeBounds(element) : element;
                            if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                                element.erased = true;
                            }
                        }
                    });
                }
                else if (editor.state.action === ACTIONS.CREATE) {
                    editor.state.current = STATES.CREATING;
                    const element = activeElement;
                    // First, update the second point of the element
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (editor.state.action === ACTIONS.TRANSLATE) {
                    editor.state.current = STATES.TRANSLATING;
                    isDragged = true;
                    sceneActions.getSelection(scene).forEach((element, index) => {
                        element.x1 = getPosition(snapshot[index].x1 + event.dx);
                        element.y1 = getPosition(snapshot[index].y1 + event.dy);
                        element.x2 = element.x1 + (snapshot[index].x2 - snapshot[index].x1);
                        element.y2 = element.y1 + (snapshot[index].y2 - snapshot[index].y1);
                        // Execute the onDrag function
                        getElementConfig(element)?.onDrag?.(element, snapshot[index], event);
                    });
                }
                else if (editor.state.action === ACTIONS.RESIZE) {
                    editor.state.current = STATES.RESIZING;
                    isResized = true;
                    const element = sceneActions.getElement(scene, snapshot[0].id);
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
                else if (editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT) {
                    editor.state.current = STATES.BRUSHING;
                    editor.state.selection.x2 = event.currentX;
                    editor.state.selection.y2 = event.currentY;
                }
                // Force editor update
                editor.update();
            },
            onPointerUp: event => {
                editor.state.current = STATES.IDLE;
                if (editor.state.action === ACTIONS.MOVE) {
                    lastTranslateX = scene.state.translateX;
                    lastTranslateY = scene.state.translateY;
                    // callbacks?.onChange?.({
                    //     translateX: board.translateX,
                    //     translateY: board.translateY,
                    // });
                    return editor.update();
                }
                else if (editor.state.action === ACTIONS.ERASE) {
                    // board.erase = null;
                    sceneActions.removeElements(scene, scene.elements.filter(el => el.erased));
                    callbacks?.onChange?.({
                        elements: scene.elements,
                    });
                    return editor.update();
                }
                else if (editor.state.action === ACTIONS.CREATE && activeElement) {
                    const element = activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = scene.history[0] || {};
                    if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                        last.elements[0].newValues = {
                            ...element,
                            selected: false,
                        };
                    }
                    // Call the element created listener
                    callbacks?.onChange?.({
                        elements: scene.elements,
                    });
                    activeElement = null;
                    // Check if the tool is not the handdraw
                    // TODO: we need also to check if lock is enabled
                    if (!editor.state.toolLock && editor.state.tool !== ELEMENTS.DRAW) {
                        editor.state.tool = null;
                    }
                    else {
                        // If tool is locked, we need to reset the current selection
                        element.selected = false;
                    }
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        element.editing = true;
                        activeElement = element;
                        editor.state.action = ACTIONS.EDIT;
                        return editor.update();
                    }
                }
                else if (editor.state.action === ACTIONS.TRANSLATE || editor.state.action === ACTIONS.RESIZE) {
                    if (isDragged || isResized) {
                        if (editor.state.action === ACTIONS.RESIZE && snapshot.length === 1) {
                            const element = sceneActions.getElement(scene, snapshot[0].id);
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.onResizeEnd === "function") {
                                elementConfig.onResizeEnd(element, snapshot[0], event);
                            }
                        }
                        sceneActions.addHistory(scene, {
                            type: CHANGES.UPDATE,
                            elements: sceneActions.getSelection(scene).map((element, index) => {
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
                            elements: scene.elements,
                        });
                    }
                    else if (event.element) {
                        const element = sceneActions.getElement(scene, event.element);
                        if (!event.shiftKey) {
                            sceneActions.clearSelection(scene);
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !isPrevSelected;
                        }
                        // Select all elements of this group
                        // if (element.group && !board.activeGroup) {
                        //     board.elements.forEach(el => {
                        //         el.selected = el.group === element.group ? element.selected : el.selected;
                        //     });
                        // }
                    }
                    isDragged = false;
                    isResized = false;
                }
                else if (editor.state.action === ACTIONS.SELECT) {
                    const selection = editor.state.selection;
                    sceneActions.setSelection(scene, {
                        x1: Math.min(selection.x1, selection.x2),
                        x2: Math.max(selection.x1, selection.x2),
                        y1: Math.min(selection.y1, selection.y2),
                        y2: Math.max(selection.y1, selection.y2),
                    });
                }
                else if (editor.state.action === ACTIONS.SCREENSHOT) {
                    callbacks?.onScreenshot?.({
                        ...editor.state.selection,
                    });
                }
                editor.state.selection = null;
                editor.state.action = null;
                editor.update();
            },
            onDoubleClickElement: event => {
                if (!editor.state.action && !editor.state.tool) {
                    // board.clearSelectedElements();
                    const element = sceneActions.getElement(scene, event.element);
                    // if (!board.activeGroup && element.group) {
                    //     board.activeGroup = element.group;
                    //     board.clearSelectedElements();
                    //     element.selected = true; // Mark this element as selected
                    // }
                    if (element && !element.locked) {
                        activeElement = element;
                        activeElement.editing = true;
                        editor.state.action = ACTIONS.EDIT;
                    }
                    editor.update();
                }
            },
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (editor.state.action === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        if (activeElement?.editing) {
                            if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                                removeTextElement(activeElement);
                            }
                        }
                        editor.actions.setAction(null);
                        editor.update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        editor.actions.copy();
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        sceneActions.removeSelection(scene);
                        callbacks?.onChange?.({
                            elements: scene.elements,
                            assets: scene.assets,
                        });
                    }
                    editor.update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    editor.actions.setAction(null);
                    sceneActions.clearSelection(scene);
                    activeElement = null;
                    event.key === KEYS.Z ? sceneActions.undo(scene) : sceneActions.redo(scene);
                    callbacks?.onChange?.({
                        elements: scene.elements,
                        assets: scene.assets,
                    });
                    editor.update();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    if (editor.state.action === ACTIONS.SCREENSHOT) {
                        editor.state.action = null;
                    }
                    // Check for active group enabled --> exit group edition
                    // if (board.activeGroup) {
                    //     board.activeGroup = null;
                    // }
                    event.preventDefault();
                    sceneActions.clearSelection(scene);
                    editor.update();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = sceneActions.getSelection(scene);
                    sceneActions.addHistory(scene, {
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
                        elements: scene.elements,
                    });
                    editor.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (isInputTarget(event)) {
                    return null;
                }
                sceneActions.clearSelection(scene);
                // board.activeGroup = null;
                editor.state.contextMenu = false;
                editor.actions.paste(event).then(() => {
                    editor.update();
                    callbacks?.onChange?.({
                        elements: scene.elements,
                        assets: scene.assets,
                    });
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, keys, values) => {
                if (activeElement?.id === id && activeElement?.editing) {
                    sceneActions.updateElements(scene, [activeElement], keys, values, true);
                    callbacks?.onChange?.({
                        elements: scene.elements,
                    });
                    editor.update();
                }
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
            onResize: event => {
                if (event?.canvasWidth && event?.canvasHeight) {
                    scene.width = event.canvasWidth;
                    scene.height = event.canvasHeight;
                    editor.update();
                }
            },
        };
    }

    return events.current;
};
