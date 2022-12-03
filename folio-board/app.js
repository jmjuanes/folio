import {
    ELEMENTS,
    ACTIONS,
    CHANGES,
    GRID_SIZE,
    IS_DARWIN,
    KEYS,
    ZOOM_INITIAL,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
} from "./constants.js";
import {getElementSvg} from "./elements/index.jsx";
import {
    generateID,
    isInputTarget,
    isArrowKey,
    getDataFromClipboard,
    normalizeBounds,
} from "./utils/index.js";

export const createApp = (width, height, callbacks) => {
    const state = {
        elements: [],
        snapshot: null,
        history: [],
        historyIndex: 0,
        style: {},
        selection: null,
        activeTool: null,
        activeAction: null,
        activeElement: null,
        activeGroup: null,
        zoom: ZOOM_INITIAL,
        translateX: 0,
        translateY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        isDragged: false,
        isResized: false,
    };
    const app = {
        id: generateID(),
        elements: [],
        state: state,
        util: {
            getPosition: pos => {
                // return app.settings.showGrid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
                return Math.round(pos / GRID_SIZE) * GRID_SIZE;
            },
        },

        //
        // Global API
        //
        update: () => {
            // Trigger an update from the callbacks
            return callbacks?.onUpdate?.();
        },
        clear: () => {
            state.elements = [];
            state.activeElement = null;
            state.activeGroup = null;
            state.activeTool = null;
            app.clearHistory();
        },

        //
        // Elements API
        //
        getElement: id => state.elements.find(el => el.id === id),
        createElement: type => ({
            type: type,
            id: generateID(),
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            selected: false,
            editing: false,
            locked: false,
            group: null,
            edgeHandlers: false,
            cornerHandlers: false,
            nodeHandlers: false,
            ...state.style,
        }),

        //
        // Elements management API
        // 
        getElements: () => state.elements,
        addElements: elements => {
            // 1. Register element create in the history
            app.addHistory({
                type: CHANGES.CREATE,
                elements: elements.map(element => ({
                    id: element.id,
                    prevValues: null,
                    newValues: {
                        ...element,
                        selected: false,
                    },
                })),
            });
            // 2. Add new elements
            elements.forEach(element => state.elements.push(element));
        },
        removeElements: elements => {
            // 1. Register element remove in the history
            app.addHistory({
                type: CHANGES.REMOVE,
                elements: elements.map(element => ({
                    id: element.id,
                    prevValues: {
                        ...element,
                        selected: false,
                    },
                    newValues: null,
                })),
            });
            // 2. Remove the elements for state.elements
            const elementsToRemove = new Set(elements.map(element => element.id));
            state.elements = state.elements.filter(element => !elementsToRemove.has(element.id));
        },
        updateElements: (elements, keys, values, groupChanges = true) => {
            // 1. Register element update in the history
            app.addHistory({
                type: CHANGES.UPDATE,
                ids: groupChanges && elements.map(element => element.id).join(","),
                keys: groupChanges && keys.join(","),
                elements: elements.map(element => ({
                    id: element.id,
                    prevValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    newValues: Object.fromEntries(keys.map((key, index) => [key, values[index]])),
                })),
            });
            // 2. Update the elements
            elements.forEach(element => {
                keys.forEach((key, index) => element[key] = values[index]);
            });
        },
        pasteElements: elements => {
            app.clearSelectedElements();
            // 1. Process new elements
            const groups = new Map();
            const newElements = elements.map(element => {
                if (elements.length > 1 && !!element.group && !groups.has(element.group)) {
                    groups.set(element.group, generateID());
                }
                return {
                    ...element,
                    id: generateID(),
                    selected: true,
                    group: state.activeGroup || groups.get(element.group) || null,
                };
            });
            // 2. insert new elements
            newElements.forEach(element => state.elements.push(element));
            // 3. register history change
            app.addHistory({
                type: CHANGES.CREATE,
                elements: newElements.map(element => ({
                    id: element.id,
                    prevValues: null,
                    newValues: {
                        ...element,
                        selected: false,
                    },
                })),
            });
        },

        //
        // Elements selection API
        //
        getSelectedElements: () => state.elements.filter(el => !!el.selected),
        clearSelectedElements: () => state.elements.forEach(el => el.selected = false),
        setSelectedElements: selection => {
            state.elements.forEach(element => {
                element.selected = false;
                if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                    if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                        element.selected = true;
                    }
                }
            });
        },
        removeSelectedElements: () => {
            return app.removeElements(app.getSelectedElements());
        },
        snapshotSelectedElements: () => {
            return app.getSelectedElements().map(el => ({...el}));
        },
        updateSelectedElements: (key, value) => {
            return app.updateElements(app.getSelectedElements(), [key], [value], false);
        },
        cloneSelectedElements: () => {
            return app.pasteElements(app.snapshotSelectedElements());
        },

        //
        // Groups API
        //
        getElementsInGroup: group => {
            return state.elements.filter(el => el.group && el.group === group);
        },
        getElementsInActiveGroup: () => {
            return state.activeGroup ? app.getElementsInGroup(state.activeGroup) : [];
        },
         
        //
        // History API
        //
        clearHistory: () => {
            state.history = [];
            state.historyIndex = 0;
        },
        addHistory: entry => {
            if (state.historyIndex > 0) {
                state.history = state.history.slice(state.historyIndex);
                state.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && state.history.length > 0) {
                const last = state.history[0];
                if (last.ids === entry.ids && last.keys === entry.keys) {
                    const keys = entry.keys.split(",");
                    return last.elements.forEach((element, index) => {
                        element.newValues = Object.fromEntries(keys.map(key => {
                            return [key, entry.elements[index].newValues[key]];
                        }));
                    });
                }
            }
            // Register the new history entry
            state.history.unshift(entry);
        },
        undo: () => {
            if (state.historyIndex < state.history.length) {
                const entry = state.history[state.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = state.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === CHANGES.REMOVE) {
                    entry.elements.forEach(el => state.elements.unshift({...el.prevValues}));
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(state.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                state.historyIndex = state.historyIndex + 1;
                app.cancelAction();
                state.activeGroup = null;
                state.elements.forEach(el => el.selected = false);
                app.update();
            }
        },
        redo: () => {
            if (state.historyIndex > 0 && state.history.length > 0) {
                state.historyIndex = state.historyIndex - 1;
                const entry = state.history[state.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    entry.elements.forEach(el => state.elements.unshift({...el.newValues}));
                } else if (entry.type === CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    state.elements = state.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(state.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                app.cancelAction();
                state.activeGroup = null;
                state.elements.forEach(el => el.selected = false);
                app.update();
            }
        },
        isUndoDisabled: () => state.historyIndex >= state.history.length,
        isRedoDisabled: () => state.historyIndex === 0 || state.history.length < 1,

        // Cut / Copy / Paste actions
        // cut: () => {
        //     // First copy all items and then remove selection
        //     return app.copy().then(() => {
        //         if (!app.isReadOnly) {
        //             app.removeSelectedElements();
        //             app.registerSelectionRemove();
        //         }
        //     });
        // },
        // copy: () => {
        //     const elements = board.current.copySelectedElements();
        //     const data = `folio:::${JSON.stringify(elements)}`;
        //     if (window?.navigator?.clipboard) {
        //         return navigator.clipboard.writeText(data);
        //     }
        //     // If clipboard is not available
        //     return Promise.reject(new Error("Clipboard not available"));
        // },
        // paste: event => {
        // },

        //
        // Export API
        //
        export: () => {
            return state.elements.map(el => ({
                ...el,
                selected: false,
            }));
        },
        exportImage: () => {
            return null;
        },
        exportJson: () => {
            return app.export();
        },

        // 
        // Canvas events
        // 
        events: {
            onPointCanvas: event => {
                app.cancelAction();
                if (!state.activeTool) {
                    app.clearSelectedElements();
                    app.update();
                }
            },
            onPointElement: event => {
                if (!state.activeTool && !state.activeAction) {
                    const element = app.getElement(event.element);
                    if (!event.shiftKey) {
                        app.clearSelectedElements();
                        element.selected = true;
                    }
                    else {
                        // Toggle element selection
                        element.selected = !element.selected;
                    }
                    app.update();
                }
            },
            onPointHandler: event => {
                state.activeAction = ACTIONS.RESIZE;
                // state.activeHandler = event.handler;
            },
            onPointerDown: event => {
                state.isDragged = false;
                state.isResized = false;
                // First we need to check if we are in a edit action
                if (state.activeAction === ACTIONS.EDIT) {
                    if (state.activeElement?.editing) {
                        state.activeElement.editing = false;
                        state.activeElement = null;
                    }
                    state.activeAction = null;
                }
                if (state.activeTool) {
                    state.activeAction = ACTIONS.CREATE;
                    const element = app.createElement(state.activeTool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.() || {}),
                        x1: app.util.getPosition(event.originalX),
                        y1: app.util.getPosition(event.originalY),
                    });
                    elementConfig.onCreateStart?.(element, event, app),
                    state.activeElement = element; // Save element reference
                    state.activeGroup = null; // Reset current group
                    app.clearSelectedElements();
                    app.addElements([element]);
                }
                else if (app.getSelectedElements().length > 0) {
                    if (!state.activeAction) {
                        state.activeAction = ACTIONS.DRAG;
                    }
                    // Save a snapshot of the current selection for calculating the correct element position
                    state.snapshot = app.snapshotSelectedElements();
                }
                else if (!state.activeAction || state.activeAction === ACTIONS.SELECT || state.activeAction === ACTIONS.SCREENSHOT) {
                    state.activeAction = state.activeAction || ACTIONS.SELECT;
                    state.selection = {
                        x1: event.originalX,
                        y1: event.originalY,
                        x2: event.originalX,
                        y2: event.originalY,
                    };
                    app.clearSelectedElements();
                }
                else if (state.activeAction === ACTIONS.MOVE) {
                    // We need to update the last translated point before start moving the board
                    state.lastTranslateX = state.translateX;
                    state.lastTranslateY = state.translateY;
                }
                app.update();
            },
            onPointerMove: event => {
                const snapshot = state.snapshot;
                if (state.activeAction === ACTIONS.MOVE) {
                    state.translateX = Math.floor(state.lastTranslateX + event.dx * state.zoom);
                    state.translateY = Math.floor(state.lastTranslateY + event.dy * state.zoom);
                }
                else if (state.activeAction === ACTIONS.CREATE) {
                    const element = state.activeElement;
                    // First, update the second point of the element
                    element.x2 = app.util.getPosition(event.currentX);
                    element.y2 = app.util.getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event, app);
                }
                else if (state.activeAction === ACTIONS.DRAG) {
                    state.isDragged = true;
                    app.getSelectedElements().forEach((element, index) => {
                        element.x1 = app.util.getPosition(element.x1 + info.dx),
                        element.x2 = app.util.getPosition(element.x2 + info.dx),
                        element.y1 = app.util.getPosition(element.y1 + info.dy),
                        element.y2 = app.util.getPosition(element.y2 + info.dy),
                        getElementConfig(element)?.onDrag?.(snapshot[index], event, app);
                    });
                }
                else if (state.activeAction === ACTIONS.RESIZE) {
                    state.isResized = true;
                    const element = app.getElement(snapshot[0].id);
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(app.util.getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                        element.y1 = Math.min(app.util.getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(app.util.getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
                        element.y1 = Math.min(app.util.getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(app.util.getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                        element.y2 = Math.max(app.util.getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(app.util.getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
                        element.y2 = Math.max(app.util.getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(app.util.getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(app.util.getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(app.util.getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(app.util.getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
                    }
                    else if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = app.util.getPosition(snapshot[0].x1 + event.dx);
                        element.y1 = app.util.getPosition(snapshot[0].y1 + event.dy);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = app.util.getPosition(snapshot[0].x2 + event.dx);
                        element.y2 = app.util.getPosition(snapshot[0].y2 + event.dy);
                    }
                }
                else if (state.activeAction === ACTIONS.SELECT || state.activeAction === ACTIONS.SCREENSHOT) {
                    state.selection.x2 = event.currentX;
                    state.selection.y2 = event.currentY;
                }
                app.update();
            },
            onPointerUp: event => {
                if (state.activeAction === ACTIONS.MOVE) {
                    state.lastTranslateX = state.translateX;
                    state.lastTranslateY = state.translateY;
                }
                else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                    const element = state.activeElement;
                    element.selected = true; // By default select this element
                    getElementConfig(activelement)?.onCreateEnd?.(element, event, app);
                    // We need to patch the history to save the new element values
                    const last = state.history[0] || {};
                    if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                        last.elements[0].newValues = {
                            ...element,
                            selected: false,
                        };
                    }
                    // Call the element created listener
                    callbacks?.onElementCreated?.(element);
                    state.activeElement = null;
                    state.activeTool = null; // reset active tool
                }
                else if (state.activeAction === ACTIONS.DRAG || state.activeAction === ACTIONS.RESIZE) {
                    if (state.isDragged || state.isResized) {
                        const snapshot = state.snapshot;
                        const keys = ["x1", "x2", "y1", "y2"];
                        app.addHistoryEntry({
                            type: CHANGES.UPDATE,
                            elements: app.getSelectedElements().map((element, index) => ({
                                id: element.id,
                                prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                newValues: Object.fromEntries(keys.map(key => [key, el[key]])),
                            })),
                        });
                    }
                    state.current.isDragged = false;
                    state.current.isResized = false;
                }
                else if (app.state.activeAction === ACTIONS.SELECT) {
                    const selection = normalizeBounds(state.selection);
                    app.setSelectedElements(selection);
                    state.selection = null;
                    // state.activeAction = null;
                }
                // else if (app.state.activeAction === ACTIONS.SCREENSHOT) {
                //     // const screenshotOptions = {
                //     //     includeBackground: false,
                //     //     region: state.current.brush,
                //     // };
                //     // toImagePNG(ref.current, props.width, props.height, screenshotOptions).then(image => {
                //     //     props.onScreenshot?.(image);
                //     //     // navigator.clipboard.write([
                //     //     //     new ClipboardItem({
                //     //     //         [image.type]: image,
                //     //     //     }),
                //     //     // ]);
                //     // });
                //     app.state.activeAction = null;
                // }
                state.activeAction = null;
                app.update();
            },
            onDoubleClick: event => {
                if (!state.activeAction && !state.activeTool) {
                    const selection = app.getSelectedElements();
                    if (selection.length === 1 && typeof selection[0].text === "string") {
                        state.activeAction = ACTIONS.EDIT;
                        state.activeElement = selection[0];
                        state.activeElement.editing = true;
                        app.update();
                    }
                }
            },
            onKeyDown: event => {
                const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
                // Check if we are in an input target and input element is active
                if (isInputTarget(event)) {
                    if (state.activeAction === ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        app.cancelAction();
                        app.update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    const elements = app.getSelectedElements();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        const data = `folio:::${JSON.stringify(elements)}`;
                        if (window?.navigator?.clipboard) {
                            return navigator.clipboard.writeText(data);
                        }
                        // If clipboard is not available
                        // return Promise.reject(new Error("Clipboard not available"));
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        app.removeElements(elements);
                        if (app.getElementsInActiveGroup().length === 0) {
                            // Reset active group if all elements of this group have been removed
                            state.activeGroup = null;
                        }
                    }
                    app.update();
                }
                // Undo or redo key
                else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                    event.key === KEYS.Z ? app.undo() : app.redo();
                }
                // Check ESCAPE key
                else if (event.key === KEYS.ESCAPE) {
                    event.preventDefault();
                    app.clearSelectedElements();
                    state.activeGroup = null;
                    app.update();
                }
                // Check for arrow keys --> move elements
                else if (isArrowKey(event.key)) {
                    event.preventDefault();
                    // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                    const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                    const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                    const selectedElements = app.getSelectedElements();
                    app.addHistory({
                        type: CHANGES.UPDATE,
                        ids: selectedElements.map(el => el.id).join(","),
                        keys: `${dir}1,${dir}2`,
                        elements: selectedElements.map(el => {
                            const prev1 = el[`${dir}1`];
                            const prev2 = el[`${dir}2`];
                            el[`${dir}1`] = event.shiftKey ? app.util.getPosition(prev1 + sign * GRID_SIZE) : prev1 + sign;
                            el[`${dir}2`] = event.shiftKey ? app.util.getPosition(prev2 + sign * GRID_SIZE) : prev2 + sign;
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
                    app.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (!isInputTarget(event)) {
                    return null;
                }
                app.clearSelectedElements();
                state.activeGroup = null;
                return getDataFromClipboard(event).then(data => {
                    if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                        const elements = JSON.parse(data.content.split("folio:::")[1].trim());
                        return app.pasteElements(elements || []);
                    }
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, key, value) => {
                if (state.activeElement?.id === id && state.activeElement?.editing) {
                    app.updateElements([state.activeElement], [key], [value], true);
                }
            },
        },

        //
        // Canvas API
        //
        getCanvas: () => document.querySelector(`svg[data-id="${app.id}"]`),
        centerCanvas: () => {
            // const target = document.getElementById(app.id);
            const target = app.getCanvas();
            if (target) {
                const size = target.getBoundingClientRect();
                const width = parseInt(target.dataset.width) || 0;
                const height = parseInt(target.dataset.height) || 0;
                state.translateX = Math.floor((size.width - width) / 2);
                state.translateY = Math.floor((size.height - height) / 2);
                // TODO: force an update?
            }
        },

        // 
        // Zoom API
        //
        getZoom: () => app.state.zoom,
        setZoom: value => {
            // TODO: check for previous action or editing action
            // app.cancelAction();
            const prevZoom = state.zoom;
            state.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
            // const target = document.getElementById(app.id);
            const target = app.getCanvas();
            if (target) {
                const size = target.getBoundingClientRect();
                state.translateX = Math.floor(state.translateX + size.width * (prevZoom - state.zoom) / 2);
                state.translateY = Math.floor(state.translateY + size.height * (prevZoom - state.zoom) / 2);
            }
            callbacks?.onUpdate?.();
        },
        zoomIn: () => app.setZoom(state.zoom + ZOOM_STEP),
        zoomOut: () => app.setZoom(state.zoom - ZOOM_STEP),

        //
        // Tool API
        // 
        getTool: () => state.activeTool,
        setTool: newTool => {
            app.cancelAction();
            app.clearSelectedElements();
            state.activeTool = newTool;
            app.update();
        },

        //
        // Actions API
        //
        getAction: () => state.activeAction,
        setAction: () => null,
        cancelAction: () => {
            if (state.activeAction === ACTIONS.EDIT && state.activeElement?.editing) {
                state.activeElement.editing = false;
            }
            else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                // TODO: remove element
            }
            state.activeElement = null;
            state.activeAction = null;
        },
    };
    return app;
};
