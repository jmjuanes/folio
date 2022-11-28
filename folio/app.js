import {
    ACTIONS,
    ELEMENTS,
    ELEMENT_CHANGES,
    GRID_SIZE,
    ZOOM_INITIAL,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
} from "./constants.js";
import {getElementSvg} from "./elements/index.jsx";
import {generateID} from "./utils/index.js";

export const createApp = (width, height, callbacks) => {
    const snapshot = null;
    const lastTranslate = {};
    const app = {
        target: null,
        readOnly: false,
        width: width,
        height: height,
        elements: [],
        style: {},
        state: {
            activeTool: null,
            activeAction: null,
            activeElement: null,
            activeGroup: null,
            zoom: ZOOM_INITIAL,
            translateX: 0,
            translateY: 0,
        },
        settings: {
            showGrid: true,
        },
        util: {
            getPosition: pos => {
                return app.settings.showGrid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
            },
        },
        update: () => {
            // Trigger an update from the callbacks
            return callbacks?.onUpdate?.();
        },
        clear: () => {
            app.elements = [];
            app.state.activeElement = null;
            app.state.activeGroup = null;
            app.clearHistory();
        },
        load: elements => {
            app.clear();
            app.elements = elements.map(element => ({
                ...element,
                selected: false,
            }));
        },
        addElement: el => app.elements.push(el),
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
                resizeHandlers: false,
                nodeHandlers: false,
                ...app.style,
            };
            app.addElement(newElement);
            return newElement;
        },
        removeElement: el => app.elements = app.elements.filter(element => el.id !== element.id),
        getElements: () => app.elements,
        getElement: id => app.elements.find(el => el.id === id),

        // Selection API
        getSelectedElements: () => app.elements.filter(el => !!el.selected),
        clearSelectedElements: () => app.elements.forEach(el => el.selected = false),
        removeSelectedElements: () => app.elements = app.elements.filter(el => !el.selected),
        exportSelectedElements: () => {
            return app.getSelectedElements().map(el => ({
                ...el,
                selected: false,
            }));
        },
        setSelectedElements: region => {
            // TODO
        },
        snapshotSelectedElements: () => app.getSelectedElements().map(el => ({...el})),
        updateSelectedElements: (key, value) => {
            app.getSelectedElements().forEach(element => {
                element[key] = value;
            });
        },
        cloneSelectedElements: null,
        cutSelectedElements: () => null,
        copySelectedElements: () => app.getSelectedElements().reverse(),

        pasteElements: elements => {
            app.clearSelectedElements();
            if (elements?.length > 0) {
                // const groupsMap = new Map();
                elements.forEach(element => {
                    // if (elements.length > 1 && el.group && !groupsMap.has(el.group)) {
                    //     groupsMap.set(el.group, generateID());
                    // }
                    app.addElement({
                        ...element,
                        id: generateID(),
                        selected: true,
                        //group: app.activeGroup || groupsMap.get(el.group) || null,
                    });
                });
                app.addHistoryEntry({
                    type: ELEMENT_CHANGES.CREATE,
                    elements: elements.map(el => ({
                        id: el.id,
                        prevValues: null,
                        newValues: {...el},
                    })),
                });
            }
        },

        //
        // Groups API
        //
        getElementsInGroup: group => {
            return app.elements.filter(el => el.group && el.group === group);
        },
        getElementsInActiveGroup: () => {
            return app.state.activeGroup ? app.getElementsInGroup(app.state.activeGroup) : [];
        },
         
        //
        // History API
        //
        history: [],
        historyIndex: 0,
        clearHistory: () => {
            app.history = [];
            app.historyIndex = 0;
        },
        addHistoryEntry: entry => {
            if (app.historyIndex > 0) {
                app.history = app.history.slice(app.historyIndex);
                app.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && app.history.length > 0) {
                const last = app.history[0];
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
            app.history.unshift(entry);
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
            if (app.historyIndex < app.history.length) {
                const entry = app.history[app.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.prevValues}));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                app.historyIndex = app.historyIndex + 1;
                app.state.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
                callbacks?.onUpdate?.();
            }
        },
        redo: () => {
            if (app.historyIndex > 0 && app.history.length > 0) {
                app.historyIndex = app.historyIndex - 1;
                const entry = app.history[app.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.newValues}));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                app.state.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
                callbacks?.onUpdate?.();
            }
        },
        isUndoDisabled: () => app.historyIndex >= app.history.length,
        isRedoDisabled: () => app.historyIndex === 0 || app.history.length < 1,

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
        //     if (app.isReadOnly) {
        //         return Promise.reject(new Error("Board is read-only"));
        //     }
        //     app.clearSelectedElements();
        //     // app.activeGroup = null;
        //     return getDataFromClipboard(event).then(data => {
        //         if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
        //             const elements = JSON.parse(data.content.split("folio:::")[1].trim());
        //             // elements.forEach(el => {
        //             //     el.x = el.x + index * (state.gridEnabled ? state.gridSize : 10);
        //             //     el.y = el.y + index * (state.gridEnabled ? state.gridSize : 10);
        //             // });
        //             app.pasteElements(elements || []);
        //             return true;
        //         }
        //     });
        // },

        //
        // Export API
        //
        export: () => {
            return app.elements.map(el => ({
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
            onPointResizeHandler: event => {
                app.state.activeAction = ACTIONS.RESIZE_ELEMENT;
                // app.state.activeHandler = event.handler;
            },
            onPointerDown: event => {
                if (app.state.activeAction === ACTIONS.EDIT_ELEMENT) {
                    // submitInput();
                    // TODO
                }
                if (app.state.activeTool) {
                    app.state.activeAction = ACTIONS.CREATE_ELEMENT;
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
                        app.state.activeAction = ACTIONS.DRAG_ELEMENT;
                    }
                    // Save a snapshot of the current selection for calculating the correct element position
                    snapshot = app.snapshotSelectedElements();
                }
                else if (app.state.activeAction === ACTIONS.MOVE) {
                    // We need to update the last translated point before start moving the board
                    lastTranslate.x = app.state.translateX;
                    lastTranslate.y = app.state.translateY;
                }
                else if (!app.state.activeAction || app.state.activeAction === ACTIONS.SCREENSHOT) {
                    // state.current.action = state.current.action || ACTIONS.SELECTION;
                    // state.current.brush.x1 = event.originalX;
                    // state.current.brush.y1 = event.originalY;
                    // state.current.brush.x2 = event.originalX;
                    // state.current.brush.y2 = event.originalY;
                }
                callbacks?.onUpdate?.();
                // forceUpdate();
            },
            onPointerMove: event => {
                if (app.state.activeAction === ACTIONS.MOVE) {
                    app.state.translateX = Math.floor(lastTranslate.x + event.dx * app.state.zoom);
                    app.state.translateY = Math.floor(lastTranslate.y + event.dy * app.state.zoom);
                }
                else if (app.state.activeAction === ACTIONS.CREATE_ELEMENT) {
                    const element = app.state.activeElement;
                    // First, update the second point of the element
                    element.x2 = app.util.getPosition(event.currentX);
                    element.y2 = app.util.getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event, app);
                }
                else if (app.state.activeAction === ACTIONS.DRAG_ELEMENT) {
                    // state.current.isDragged = true;
                    app.getSelectedElements().forEach((element, index) => {
                        element.x1 = app.util.getPosition(element.x1 + info.dx),
                        element.x2 = app.util.getPosition(element.x2 + info.dx),
                        element.y1 = app.util.getPosition(element.y1 + info.dy),
                        element.y2 = app.util.getPosition(element.y2 + info.dy),
                        getElementConfig(element)?.onDrag?.(snapshot[index], event, app);
                    });
                }
                else if (app.state.activeAction === ACTIONS.RESIZE_ELEMENT) {
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
                    else if (event.handler === HANDLERS.POINT_START) {
                        element.x1 = app.util.getPosition(snapshot[0].x1 + event.dx);
                        element.y1 = app.util.getPosition(snapshot[0].y1 + event.dy);
                    }
                    else if (event.handler === HANDLERS.POINT_END) {
                        element.x2 = app.util.getPosition(snapshot[0].x2 + event.dx);
                        element.y2 = app.util.getPosition(snapshot[0].y2 + event.dy);
                    }
                }
                else if (app.state.activeAction === ACTIONS.SELECTION || app.state.activeAction === ACTIONS.SCREENSHOT) {
                    // state.current.brush.x2 = event.currentX;
                    // state.current.brush.y2 = event.currentY;
                }
                callbacks?.onUpdate?.();
                // forceUpdate();
            },
            onPointerUp: event => {
                if (app.state.activeAction === ACTIONS.MOVE) {
                    lastTranslate.x = app.state.translateX;
                    lastTranslate.y = app.state.translateY;
                }
                else if (app.state.activeAction === ACTIONS.CREATE_ELEMENT) {
                    const element = app.state.activeElement;
                    element.selected = true; // By default select this element
                    getElementConfig(activelement)?.onCreateEnd?.(element, event, app);
                    app.registerElementCreate(element);
                    app.state.activeElement = null;
                    app.state.activeTool = null; // reset active tool
                    app.state.activeAction = null;
                }
                else if (app.state.activeAction === ACTIONS.DRAG_ELEMENT || app.state.activeAction === ACTIONS.RESIZE_ELEMENT) {
                    if (state.current.isDragged || state.current.isResized) {
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
                    app.state.activeAction = null;
                }
                else if (app.state.activeAction === ACTIONS.SELECTION) {
                    // const rectangle = normalizeRectangle(state.current.brush);
                    // // Select all elements that are in the selected rectangle
                    // app.current.getElements().forEach(element => {
                    //     const points = useBoundaryPoints(element);
                    //     element.selected = points.some(point => {
                    //         return pointInRectangle(point, rectangle);
                    //     });
                    // });
                    app.state.activeAction = null;
                }
                else if (app.state.activeAction === ACTIONS.SCREENSHOT) {
                    // const screenshotOptions = {
                    //     includeBackground: false,
                    //     region: state.current.brush,
                    // };
                    // toImagePNG(ref.current, props.width, props.height, screenshotOptions).then(image => {
                    //     props.onScreenshot?.(image);
                    //     // navigator.clipboard.write([
                    //     //     new ClipboardItem({
                    //     //         [image.type]: image,
                    //     //     }),
                    //     // ]);
                    // });
                    app.state.activeAction = null;
                }
                // Reset current state
                // state.current.action = null;
                callbacks?.onUpdate?.();
                // forceUpdate();
            },
            onDoubleClick: event => {
                if (!app.state.activeAction && !app.state.activeTool) {
                    const selection = app.getSelectedElements();
                    // if (selection.length === 1 && typeof selection[0].text === "string") {
                    if (selection.length === 1 && selection[0].type === ELEMENTS.TEXT) {
                        app.state.action = ACTIONS.EDIT_ELEMENT;
                        app.state.activeElement = selection[0];
                        app.state.activeElement.editing = true;
                        // return forceUpdate();
                        callbacks?.onUpdate?.();
                    }
                }
            },
        },

        // 
        // Zoom api
        //
        changeZoom: delta => {
            // TODO: check for previous action or editing action
            // submitInput();
            const prevZoom = app.state.zoom;
            app.state.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prevZoom + delta));
            if (app.target) {
                const size = app.target.getBoundingClientRect();
                app.state.translateX = Math.floor(app.state.translateX + size.width * (prevZoom - app.state.zoom) / 2);
                app.state.translateY = Math.floor(app.state.translateY + size.height * (prevZoom - app.state.zoom) / 2);
            }
            // forceUpdate();
            callbacks?.onUpdate?.();
        },
        zoomIn: () => app.changeZoom(ZOOM_STEP),
        zoomOut: () => app.changeZoom(-ZOOM_STEP),

        //
        // Setters API
        // 
        setTool: newTool => {
            const selectedElements = app.getSelectedElements();
            if (selectedElements.length > 0) {
                if (selectedElements.length === 1 && selectedElements[0].editing) {
                    selectedElements[0].editing = false;
                }
                app.clearSelectedElements();
            }
            app.state.activeTool = newTool;
            app.state.activeAction = null;
            callbacks?.onUpdate?.();
        },
        setSettings: newSettings => {
            return null;
        },
    };
    return app;
};
