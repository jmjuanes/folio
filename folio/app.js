import {
    ELEMENTS,
    ELEMENT_ACTIONS,
    ELEMENT_CHANGES,
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
} from "./utils/index.js";

export const createApp = (width, height, callbacks) => {
    const state = {
        elements: [],
        snapshot: null,
        history: [],
        historyIndex: 0,
        style: {},
        activeTool: null,
        activeAction: null,
        activeElement: null,
        activeGroup: null,
        zoom: ZOOM_INITIAL,
        translateX: 0,
        translateY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
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
        // addElement: el => state.elements.push(el),
        createElement: type => {
            const newElement = {
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
            };
            state.elements.push(newElement);
            return newElement;
        },
        removeElement: el => {
            state.elements = state.elements.filter(element => el.id !== element.id);
        },
        getElements: () => state.elements,
        setElements: newElements => {
            state.elements = newElements.map(element => ({
                ...element,
                selected: false,
            }));
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
            app.addHistoryEntry({
                type: ELEMENT_CHANGES.CREATE,
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
        removeSelectedElements: () => {
            app.registerSelectionRemove();
            state.elements = state.elements.filter(el => !el.selected);
        },
        setSelectedElements: region => {
            state.elements.forEach(element => {
                element.selected = false;
                if (region.x1 < element.x2 && element.x1 < region.x2) {
                    if (region.y1 < element.y2 && element.y1 < region.y2) {
                        element.selected = true;
                    }
                }
            });
        },
        snapshotSelectedElements: () => {
            return app.getSelectedElements().map(el => ({...el}));
        },
        updateSelectedElements: (key, value) => {
            app.registerSelectionUpdate([key], [value], true);
            app.getSelectedElements().forEach(element => {
                element[key] = value;
            });
        },
        cloneSelectedElements: () => {
            app.pasteElements(app.snapshotSelectedElements());
        },
        cutSelectedElements: () => {
            const removedElements = app.getSelectedElements();
            app.removeSelectedElements();
            return removedElements;
        },
        copySelectedElements: () => {
            return app.getSelectedElements();
        },

        //
        // Elements input
        //
        // submitElementInput: () => {
        //     const snapshot = internal.snapshot;
        //     if (snapshot?.[0]?.editing && app.state.activeElement?.id === snapshot?.[0]?.id) {
        //         app.state.activeElement.text = snapshot[0].text || "";
        //         app.state.activeElement.editing = false; // Reset edit
        //         app.state.activeElement = null;                
        //         internal.snapshot = null; // We need to reset the snapshot
        //     }
        // },
        // cancelElementInput: () => {
        //     const snapshot = internal.snapshot;
        //     if (snapshot?.[0]?.editing && app.state.activeElement?.id === snapshot?.[0]?.id) {
        //         app.state.activeElement.editing = false;
        //         app.state.activeElement = null;
        //         internal.snapshot = null;
        //     }
        // },

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
        addHistoryEntry: entry => {
            if (state.historyIndex > 0) {
                state.history = state.history.slice(state.historyIndex);
                state.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && state.history.length > 0) {
                const last = state.history[0];
                if (last.ids === entry.ids && last.keys === entry.keys) {
                    const keys = entry.keys.split(",");
                    last.elements.forEach((element, index) => {
                        element.newValues = Object.fromEntries(keys.map(key => {
                            return [key, entry.elements[index].newValues[key]];
                        }));
                    });
                    return;
                }
            }
            // Register the new history entry
            state.history.unshift(entry);
        },
        registerSelectionUpdate: (keys, values, groupChanges) => {
            const selectedElements = app.getSelectedElements();
            app.addHistoryEntry({
                type: ELEMENT_CHANGES.UPDATE,
                ids: groupChanges && selectedElements.map(el => el.id).join(","),
                keys: groupChanges && keys.join(","),
                elements: selectedElements.map(element => ({
                    id: element.id,
                    prevValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    newValues: Object.fromEntries(keys.map((key, index) => [key, values[index]])),
                })),
            });
        },
        registerSelectionRemove: () => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.REMOVE,
                elements: app.getSelectedElements().map(element => ({
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                })),
            });
        },
        registerElementCreate: element => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.CREATE,
                elements: [{
                    id: element.id,
                    prevValues: null,
                    newValues: {...element},
                }],
            });
        },
        registerElementRemove: element => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.REMOVE,
                elements: [{
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                }],
            });
        },
        undo: () => {
            if (state.historyIndex < state.history.length) {
                const entry = state.history[state.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = state.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    entry.elements.forEach(el => state.elements.unshift({...el.prevValues}));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(state.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                state.historyIndex = state.historyIndex + 1;
                app.cancelAction();
                state.activeGroup = null;
                state.elements.forEach(el => el.selected = false);
                callbacks?.onUpdate?.();
            }
        },
        redo: () => {
            if (state.historyIndex > 0 && state.history.length > 0) {
                state.historyIndex = state.historyIndex - 1;
                const entry = state.history[state.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    entry.elements.forEach(el => state.elements.unshift({...el.newValues}));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    state.elements = state.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(state.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                app.cancelAction();
                state.activeGroup = null;
                state.elements.forEach(el => el.selected = false);
                callbacks?.onUpdate?.();
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
                if (!app.state.activeTool) {
                    app.clearSelectedElements();
                    callbacks?.onUpdate?.();
                }
            },
            onPointElement: event => {
                if (!app.state.activeTool && !app.state.activeAction) {
                    const element = app.getElement(event.element);
                    if (!event.shiftKey) {
                        app.clearSelectedElements();
                        element.selected = true;
                    }
                    else {
                        // Toggle element selection
                        element.selected = !element.selected;
                    }
                    callbacks?.onUpdate?.();
                }
            },
            onPointHandler: event => {
                app.state.activeAction = ELEMENT_ACTIONS.RESIZE;
                // app.state.activeHandler = event.handler;
            },
            onPointerDown: event => {
                // First we need to check if we are in a edit action
                if (app.state.activeAction === ELEMENT_ACTIONS.EDIT) {
                    if (app.state.activeElement?.editing) {
                        app.state.activeElement.editing = false;
                    }
                    app.state.activeAction = null;
                }
                if (app.state.activeTool) {
                    app.state.activeAction = ELEMENT_ACTIONS.CREATE;
                    const element = app.createElement(app.state.activeTool);
                    const elementConfig = getElementConfig(element);
                    // Override element attributes
                    Object.assign(element, {
                        ...(elementConfig.initialize?.() || {}),
                        x1: app.util.getPosition(event.originalX),
                        y1: app.util.getPosition(event.originalY),
                    });
                    elementConfig.onCreateStart?.(element, event, app),
                    app.state.activeElement = element; // Save element reference
                    // app.state.activeGroup = null; // Reset current group
                    app.clearSelectedElements();
                }
                else if (app.getSelectedElements().length > 0) {
                    if (!app.state.activeAction) {
                        app.state.activeAction = ELEMENT_ACTIONS.DRAG;
                    }
                    // Save a snapshot of the current selection for calculating the correct element position
                    internal.snapshot = app.snapshotSelectedElements();
                }
                // else if (app.state.activeAction === ACTIONS.MOVE) {
                //     // We need to update the last translated point before start moving the board
                //     internal.lastTranslateX = app.state.translateX;
                //     internal.lastTranslateY = app.state.translateY;
                // }
                callbacks?.onUpdate?.();
            },
            onPointerMove: event => {
                const snapshot = internal.snapshot;
                // if (app.state.activeAction === ACTIONS.MOVE) {
                //     app.state.translateX = Math.floor(internal.lastTranslateX + event.dx * app.state.zoom);
                //     app.state.translateY = Math.floor(internal.lastTranslateY + event.dy * app.state.zoom);
                // }
                if (app.state.activeAction === ELEMENT_ACTIONS.CREATE) {
                    const element = app.state.activeElement;
                    // First, update the second point of the element
                    element.x2 = app.util.getPosition(event.currentX);
                    element.y2 = app.util.getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event, app);
                }
                else if (app.state.activeAction === ELEMENT_ACTIONS.DRAG) {
                    // state.current.isDragged = true;
                    app.getSelectedElements().forEach((element, index) => {
                        element.x1 = app.util.getPosition(element.x1 + info.dx),
                        element.x2 = app.util.getPosition(element.x2 + info.dx),
                        element.y1 = app.util.getPosition(element.y1 + info.dy),
                        element.y2 = app.util.getPosition(element.y2 + info.dy),
                        getElementConfig(element)?.onDrag?.(snapshot[index], event, app);
                    });
                }
                else if (app.state.activeAction === ELEMENT_ACTIONS.RESIZE) {
                    const element = app.getElement(snapshot[0].id);
                    // state.current.isResized = true;
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
                callbacks?.onUpdate?.();
                // forceUpdate();
            },
            onPointerUp: event => {
                // if (app.state.activeAction === ACTIONS.MOVE) {
                //     internal.lastTranslateX = app.state.translateX;
                //     internal.lastTranslateY = app.state.translateY;
                // }
                if (state.activeAction === ELEMENT_ACTIONS.CREATE) {
                    const element = state.activeElement;
                    element.selected = true; // By default select this element
                    getElementConfig(activelement)?.onCreateEnd?.(element, event, app);
                    app.registerElementCreate(element);
                    state.activeElement = null;
                    state.activeTool = null; // reset active tool
                    // TODO: selection or screenshot elements must be removed and applied the effect
                    callbacks?.onElementCreated?.(element);
                }
                else if (state.activeAction === ELEMENT_ACTIONS.DRAG || state.activeAction === ELEMENT_ACTIONS.RESIZE) {
                    if (state.isDragged || state.isResized) {
                        // const snapshot = state.current.snapshot;
                        // const keys = state.current.isDragged ? ["x", "y"] : ["x", "y", "width", "height"];
                        // app.current.addHistoryEntry({
                        //     type: ELEMENT_CHANGE_TYPES.UPDATE,
                        //     elements: app.current.getSelectedElements().map((el, index) => ({
                        //         id: el.id,
                        //         prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                        //         newValues: Object.fromEntries(keys.map(key => [key, el[key]])),
                        //     })),
                        // });
                    }
                    // state.current.isDragged = false;
                    // state.current.isResized = false;
                }
                // else if (app.state.activeAction === ACTIONS.SELECTION) {
                //     // const rectangle = normalizeRectangle(state.current.brush);
                //     // // Select all elements that are in the selected rectangle
                //     // app.current.getElements().forEach(element => {
                //     //     const points = useBoundaryPoints(element);
                //     //     element.selected = points.some(point => {
                //     //         return pointInRectangle(point, rectangle);
                //     //     });
                //     // });
                //     app.state.activeAction = null;
                // }
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
                        state.activeAction = ELEMENT_ACTIONS.EDIT;
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
                    if (state.activeAction === ELEMENT_ACTIONS.EDIT && event.key === KEYS.ESCAPE) {
                        event.preventDefault();
                        app.cancelAction();
                        app.update();
                    }
                }
                else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                    event.preventDefault();
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        const elements = app.getSelectedElements();
                        const data = `folio:::${JSON.stringify(elements)}`;
                        if (window?.navigator?.clipboard) {
                            return navigator.clipboard.writeText(data);
                        }
                        // If clipboard is not available
                        // return Promise.reject(new Error("Clipboard not available"));
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        // app.registerSelectionRemove();
                        app.removeSelectedElements();
                        // Reset active group if all elements of this group have been removed
                        // if (app.current.getElementsInActiveGroup().length < 1) {
                        //     app.current.activeGroup = null;
                        // }
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
                    app.addHistoryEntry({
                        type: ELEMENT_CHANGES.UPDATE,
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
                    // forceUpdate();
                    app.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (!isInputTarget(event) || !!app.readOnly) {
                    return null;
                }
                app.clearSelectedElements();
                // state.activeGroup = null;
                return getDataFromClipboard(event).then(data => {
                    if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                        const elements = JSON.parse(data.content.split("folio:::")[1].trim());
                        // elements.forEach(el => {
                        //     el.x = el.x + index * (state.gridEnabled ? state.gridSize : 10);
                        //     el.y = el.y + index * (state.gridEnabled ? state.gridSize : 10);
                        // });
                        app.pasteElements(elements || []);
                        return true;
                    }
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, key, value) => {
                if (state.activeElement?.id === id && state.activeElement?.editing) {
                    state.activeElement[key] = value;
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
        getTool: () => app.state.activeTool,
        setTool: newTool => {
            app.cancelAction();
            app.clearSelectedElements();
            state.activeTool = newTool;
            app.update();
        },

        //
        // Actions API
        //
        setAction: () => null,
        cancelAction: () => {
            if (state.activeAction === ELEMENT_ACTIONS.EDIT && state.activeElement?.editing) {
                state.activeElement.editing = false;
            }
            else if (state.activeAction === ELEMENT_ACTIONS.CREATE && state.activeElement) {
                // TODO: remove element
            }
            state.activeElement = null;
            state.activeAction = null;
        },
    };
    return app;
};
