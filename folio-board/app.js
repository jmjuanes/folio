import {
    ELEMENTS,
    HANDLERS,
    ACTIONS,
    CHANGES,
    GRID_SIZE,
    IS_DARWIN,
    KEYS,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
} from "./constants.js";
import {getElementConfig} from "./elements.jsx";
import {getDefaultState} from "./state.js";
import {fontSizes, fontFaces} from "./styles.js";
import {
    generateID,
    isInputTarget,
    isArrowKey,
    getDataFromClipboard,
    copyTextToClipboard,
    normalizeBounds,
    measureText,
    loadImage,
} from "./utils/index.js";

export const createApp = callbacks => {
    const state = getDefaultState();
    const getPosition = pos => {
        return state.grid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
    };
    const app = {
        id: generateID(),
        state: state,
        elements: [],
        assets: {},
        history: [],
        historyIndex: 0,
        //
        // Global API
        //
        update: () => {
            // Trigger an update from the callbacks
            return callbacks?.onUpdate?.();
        },
        reset: () => {
            state.activeElement = null;
            state.activeGroup = null;
            state.activeTool = null;
            app.elements = [];
            app.assets = {};
            app.history = [];
            app.historyIndex = 0;
        },
        copy: () => {
            const elements = app.getSelectedElements();
            return {
                elements: elements,
                assets: elements.reduce((assets, element) => {
                    // Copy only assets in the current selection
                    if (element.assetId && app.assets[element.assetId]) {
                        assets[element.assetId] = app.assets[element.assetId];
                    }
                    return assets;
                }, {}),
            };   
        },
        paste: data => {
            // We need to register the provided assets in the new assets object
            // To prevent different assets ids, we will use a map to convert provided assets Ids to new assets ids
            const assetMap = {};
            Object.keys(data?.assets || {}).forEach(assetId => {
                assetMap[assetId] = app.addAsset(data.assets[assetId]);
            });
            // Paste provided elements
            app.pasteElements((data?.elements || []).map(originalElement => {
                const element = {...originalElement};
                if (!!element.assetId && !!assetMap[element.assetId]) {
                    element.assetId = assetMap[element.assetId];
                }
                return element;
            }));
        },

        // 
        // State API
        // 
        getState: () => ({
            background: app.state.background,
            grid: !!app.state.grid,
        }),
        setState: newState => {
            Object.assign(app.state, newState || {});
        },
        updateState: (key, value) => {
            app.state[key] = value;
        },

        //
        // Assets API
        //
        getAssets: () => ({...app.assets}),
        setAssets: newAssets => {
            app.assets = {...newAssets};
        },
        clearAssets: () => app.setAssets({}),
        getAsset: assetId => app.assets[assetId] || "",
        addAsset: data => {
            // First we need to check if this asset is already registered
            let assetId = Object.keys(app.assets).find(assetId => {
                return app.assets[assetId] === data;
            });
            if (!assetId) {
                // Register this asset using a new identifier
                assetId = generateID();
                app.assets[assetId] = data;
            }
            return assetId;
        },

        //
        // Elements API
        //
        getElement: id => app.elements.find(el => el.id === id),
        createElement: type => ({
            type: type,
            id: generateID(),
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            minWidth: 1,
            minHeight: 1,
            selected: false,
            creating: false,
            editing: false,
            locked: false,
            group: null,
            edgeHandlers: false,
            cornerHandlers: false,
            nodeHandlers: false,
        }),

        //
        // Elements management API
        // 
        getElements: () => app.elements,
        setElements: newElements => {
            app.elements = (newElements || []).map(element => ({
                ...element,
                selected: false,
            }));
            app.clearHistory();
        },
        clearElements: () => app.setElements([]),
        addElements: elements => {
            if (elements && elements.length > 0) {
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
                elements.forEach(element => app.elements.push(element));
            }
        },
        removeElements: elements => {
            if (elements && elements.length > 0) {
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
                // 2. Remove the elements for app.elements
                const elementsToRemove = new Set(elements.map(element => element.id));
                app.elements = app.elements.filter(element => {
                    return !elementsToRemove.has(element.id);
                });
            }
        },
        updateElements: (elements, keys, values, groupChanges = true) => {
            if (elements && elements.length > 0) {
                // 1. Register element update in the history
                app.addHistory({
                    type: CHANGES.UPDATE,
                    ids: groupChanges && elements.map(element => element.id).join(","),
                    keys: groupChanges && keys.join(","),
                    elements: elements.map(element => ({
                        id: element.id,
                        prevValues: Object.fromEntries(keys.map(key => {
                            return [key, element[key]];
                        })),
                        newValues: Object.fromEntries(keys.map((key, index) => {
                            return [key, values[index]];
                        })),
                    })),
                });
                // 2. Update the elements
                elements.forEach(element => {
                    keys.forEach((key, index) => element[key] = values[index]);
                });
            }
            // 3. Update default styles
            keys.forEach((key, index) => {
                if (typeof state.style[key] !== "undefined") {
                    state.style[key] = values[index];
                }
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
            newElements.forEach(element => app.elements.push(element));
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
        // Miscellanea elements API
        //
        addText: text => {
            app.clearSelectedElements();
            const size = app.getCanvas()?.getBoundingClientRect();
            const x = state.translateX + size.width / 2;
            const y = state.translateY + size.height / 2;
            const element = app.createElement(ELEMENTS.TEXT);
            const elementConfig = getElementConfig(element);
            const textSize = fontSizes[state.style.textSize];
            const textFont = fontFaces[state.style.textFont];
            const [textWidth, textHeight] = measureText(text || " ", textSize, textFont);
            // Override element attributes
            Object.assign(element, {
                ...(elementConfig.initialize?.(state.style) || {}),
                text: text,
                x1: Math.floor((x - textWidth / 2) / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - textHeight / 2) / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + textWidth / 2) / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + textHeight / 2) / GRID_SIZE) * GRID_SIZE,
                textWidth: textWidth,
                textHeight: textHeight,
                minWidth: Math.ceil(textWidth / GRID_SIZE) * GRID_SIZE,
                minHeight: Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE,
                selected: true,
            });
            app.addElements([element]);
            return Promise.resolve(element);
        },
        addImage: image => {
            app.clearSelectedElements();
            return loadImage(image).then(img => {
                const size = app.getCanvas()?.getBoundingClientRect();
                const x = state.translateX + size.width / 2;
                const y = state.translateY + size.height / 2;
                const element = app.createElement(ELEMENTS.IMAGE);
                const elementConfig = getElementConfig(element);
                Object.assign(element, {
                    ...(elementConfig.initialize?.(state.style) || {}),
                    assetId: app.addAsset(image),
                    // image: image,
                    imageWidth: img.width,
                    imageHeight: img.height,
                    x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                    y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                    x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                    y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                    selected: true,
                });
                app.addElements([element]);
                return element;
            });
        },

        //
        // Elements selection API
        //
        getSelectedElements: () => app.elements.filter(el => !!el.selected),
        clearSelectedElements: () => app.elements.forEach(el => el.selected = false),
        setSelectedElements: selection => {
            return app.elements.forEach(element => {
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
            return app.elements.filter(el => el.group && el.group === group);
        },
        getElementsInActiveGroup: () => {
            return state.activeGroup ? app.getElementsInGroup(state.activeGroup) : [];
        },
         
        //
        // History API
        //
        getHistory: () => ([...app.history]),
        setHistory: newHistory => {
            app.history = newHistory || [];
            app.historyIndex = 0;
        },
        clearHistory: () => app.setHistory([]),
        addHistory: entry => {
            if (app.historyIndex > 0) {
                app.history = app.history.slice(app.historyIndex);
                app.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && app.history.length > 0) {
                const last = app.history[0];
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
            app.history.unshift(entry);
        },
        undo: () => {
            if (app.historyIndex < app.history.length) {
                const entry = app.history[app.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === CHANGES.REMOVE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.prevValues}));
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                app.historyIndex = app.historyIndex + 1;
                app.cancelAction();
                state.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
                app.update();
            }
        },
        redo: () => {
            if (app.historyIndex > 0 && app.history.length > 0) {
                app.historyIndex = app.historyIndex - 1;
                const entry = app.history[app.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.newValues}));
                } else if (entry.type === CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                app.cancelAction();
                state.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
                app.update();
            }
        },
        isUndoDisabled: () => app.historyIndex >= app.history.length,
        isRedoDisabled: () => app.historyIndex === 0 || app.history.length < 1,

        // 
        // Canvas events
        // 
        events: {
            onPointCanvas: event => {
                if (state.activeAction === ACTIONS.EDIT) {
                    app.cancelAction();
                }
                if (!state.activeTool) {
                    app.clearSelectedElements();
                    app.update();
                }
            },
            onPointElement: event => {
                if (!state.activeTool && !state.activeAction) {
                    const element = app.getElement(event.element);
                    state.isPrevSelected = element.selected;
                    const inCurrentSelection = app.getSelectedElements().some(el => el.id === element.id);
                    if (!inCurrentSelection && !event.shiftKey) {
                        app.clearSelectedElements();
                    }
                    element.selected = true;
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
                        ...(elementConfig.initialize?.(state.style) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
                        x2: getPosition(event.originalX),
                        y2: getPosition(event.originalY),
                        creating: true,
                    });
                    elementConfig.onCreateStart?.(element, event),
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
                    element.x2 = getPosition(event.currentX);
                    element.y2 = getPosition(event.currentY);
                    // Second, call the onCreateMove listener of the element
                    getElementConfig(element)?.onCreateMove?.(element, event);
                }
                else if (state.activeAction === ACTIONS.DRAG) {
                    state.isDragged = true;
                    app.getSelectedElements().forEach((element, index) => {
                        element.x1 = getPosition(snapshot[index].x1 + event.dx);
                        element.x2 = getPosition(snapshot[index].x2 + event.dx);
                        element.y1 = getPosition(snapshot[index].y1 + event.dy);
                        element.y2 = getPosition(snapshot[index].y2 + event.dy);
                        // getElementConfig(element)?.onDrag?.(snapshot[index], event);
                    });
                }
                else if (state.activeAction === ACTIONS.RESIZE) {
                    state.isResized = true;
                    const element = app.getElement(snapshot[0].id);
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
                    // Prevent reset of activeAction
                    return app.update();
                }
                else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                    const element = state.activeElement;
                    element.creating = false;
                    element.selected = true; // By default select this element
                    getElementConfig(element)?.onCreateEnd?.(element, event);
                    // We need to patch the history to save the new element values
                    const last = app.history[0] || {};
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
                    // Terrible hack to enable editing in a text element
                    if (element.type === ELEMENTS.TEXT) {
                        state.activeElement = element;
                        element.editing = true;
                        state.activeAction = ACTIONS.EDIT;
                        return app.update();
                    }
                }
                else if (state.activeAction === ACTIONS.DRAG || state.activeAction === ACTIONS.RESIZE) {
                    if (state.isDragged || state.isResized) {
                        const snapshot = state.snapshot;
                        const keys = ["x1", "x2", "y1", "y2"];
                        app.addHistory({
                            type: CHANGES.UPDATE,
                            elements: app.getSelectedElements().map((element, index) => ({
                                id: element.id,
                                prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                            })),
                        });
                    }
                    else if (event.element) {
                        const element = app.getElement(event.element);
                        if (!event.shiftKey) {
                            app.clearSelectedElements();
                            element.selected = true;
                        }
                        else {
                            // Toggle element selection
                            element.selected = !state.isPrevSelected;
                        }
                    }
                    state.isDragged = false;
                    state.isResized = false;
                }
                else if (app.state.activeAction === ACTIONS.SELECT) {
                    const selection = normalizeBounds(state.selection);
                    app.setSelectedElements(selection);
                }
                else if (app.state.activeAction === ACTIONS.SCREENSHOT) {
                    const selection = normalizeBounds(state.selection);
                    const screenshotRegion = {
                        x: selection.x1,
                        y: selection.y1,
                        width: Math.abs(selection.x2 - selection.x1),
                        height: Math.abs(selection.y2 - selection.y1),
                    };
                    callbacks?.onScreenshot?.(app, screenshotRegion);
                }
                state.activeAction = null;
                state.selection = null;
                app.update();
            },
            onDoubleClickElement: event => {
                if (!state.activeAction && !state.activeTool) {
                    app.clearSelectedElements();
                    const element = app.getElement(event.element);
                    // TODO: we need to check if this element is editable
                    state.activeElement = element;
                    state.activeElement.editing = true;
                    state.activeAction = ACTIONS.EDIT;
                    app.update();
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
                    if (event.key === KEYS.X || event.key === KEYS.C) {
                        const data = `folio:::${JSON.stringify(app.copy())}`;
                        copyTextToClipboard(data).then(() => {
                            // console.log("Copied to clipboard");
                        });
                        // If clipboard is not available
                        // return Promise.reject(new Error("Clipboard not available"));
                    }
                    // Check for backspace key or cut --> remove elements
                    if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                        app.removeSelectedElements();
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
                    if (app.state.activeAction === ACTIONS.SCREENSHOT) {
                        app.cancelAction();
                    }
                    else if (app.state.showExport || app.state.showSettings) {
                        app.state.showExport = false;
                        app.state.showSettings = false;
                    }
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
                    app.update();
                }
            },
            // onKeyUp: event => {},
            onPaste: event => {
                if (isInputTarget(event)) {
                    return null;
                }
                app.clearSelectedElements();
                state.activeGroup = null;
                return getDataFromClipboard(event).then(data => {
                    // Paste elements
                    if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                        const newData = JSON.parse(data.content.split("folio:::")[1].trim());
                        app.paste(newData || {});
                        app.update();
                    }
                    // Create a new text element
                    else if (data?.type === "text") {
                        app.addText(data.content).then(() => {
                            return app.update();
                        });
                    }
                    // Create a new image element
                    else if (data?.type === "image") {
                        app.addImage(data.content).then(() => {
                            return app.update();
                        });
                    }
                });
            },
            // onCopy: event => null,
            // onCut: event => null,
            onElementChange: (id, keys, values) => {
                if (state.activeElement?.id === id && state.activeElement?.editing) {
                    app.updateElements([state.activeElement], keys, values, true);
                    app.update();
                }
            },
        },

        //
        // Canvas API
        //
        getCanvas: () => document.querySelector(`svg[data-id="${app.id}"]`),

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
        setAction: newAction => {
            app.cancelAction();
            state.activeAction = newAction;
            app.update();
        },
        cancelAction: () => {
            if (state.activeAction === ACTIONS.EDIT && state.activeElement?.editing) {
                state.activeElement.editing = false;
            }
            else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                // TODO: remove element
            }
            state.activeElement = null;
            state.activeAction = null;
            // state.activeTool = null;
        },
    };
    return app;
};
