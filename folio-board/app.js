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
import {getElementConfig} from "./elements.jsx";
import {defaultStyles} from "./styles.js";
import {
    createBlob,
    generateID,
    isInputTarget,
    isArrowKey,
    getDataFromClipboard,
    blobToClipboard,
    blobToFile,
    copyTextToClipboard,
    normalizeBounds,
} from "./utils/index.js";

export const createApp = (callbacks) => {
    const state = {
        width: 100,
        height: 100,
        elements: [],
        settings: {},
        snapshot: null,
        history: [],
        historyIndex: 0,
        style: {
            ...defaultStyles,
        },
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
    const getPosition = pos => {
        // return state.settings.showGrid ? Math.round(pos / GRID_SIZE) * GRID_SIZE : pos;
        return Math.round(pos / GRID_SIZE) * GRID_SIZE;
    };
    const app = {
        id: generateID(),
        state: state,

        //
        // Global API
        //
        update: () => {
            // Trigger an update from the callbacks
            return callbacks?.onUpdate?.();
        },
        reset: () => {
            state.elements = [];
            state.activeElement = null;
            state.activeGroup = null;
            state.activeTool = null;
            state.history = [];
            state.historyIndex = 0;
        },
        
        //
        // Board API
        //
        loadBoard: board => {
            app.reset();
            state.width = board?.width || 0;
            state.height = board?.height || 0;
            state.settings = board?.settings || {};
            // TODO: we would need to migrate the board elements to the new version
            if (board?.elements) {
                state.elements = (board.elements || []).map(element => ({
                    ...element,
                    selected: false,
                }));
            }
        },
        getBoard: () => {
            return Promise.resolve({
                version: "1",
                width: state.width,
                height: state.height,
                elements: state.elements.map(element => ({
                    ...elements,
                    selected: false,
                })),
                settings: {
                    ...state.settings,
                },
            });
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
        }),

        //
        // Elements management API
        // 
        getElements: () => state.elements,
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
                elements.forEach(element => state.elements.push(element));
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
                // 2. Remove the elements for state.elements
                const elementsToRemove = new Set(elements.map(element => element.id));
                state.elements = state.elements.filter(element => {
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
                if (typeof state.styles[key] !== "undefined") {
                    state.styles[key] = values[index];
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
            return state.elements.forEach(element => {
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

        //
        // SVG API
        //
        getSvg: options => {
            return new Promise(resolve => {
                // 1. Create a new SVG element
                const originalSvg = app.getCanvas();
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                // 2. Set new svg attributes
                svg.setAttribute("style", ""); // Reset style
                svg.setAttribute("width", state.width);
                svg.setAttribute("height", state.height);
                // 3. Set svg style
                svg.style.backgroundColor = options?.background || "#fff";
                // 4. Set svg fonts
                // TODO
                // 5. Append elements into new SVG
                state.elements.forEach(element => {
                    const nodeElement = originalSvg.querySelector(`g[data-element-id="${element.id}"]`);
                    if (nodeElement) {
                        svg.appendChild(nodeElement.cloneNode(true));
                    }
                });
                // 6. return SVG
                const svgString = (new XMLSerializer()).serializeToString(svg);
                const svgBlob = createBlob(svgString, "image/svg+xml;charset=utf-8");
                return resolve(svgBlob);
            });
        },
        copySvg: options => {
            return app.getSvg(options).then(svgBlob => {
                return blobToClipboard(svgBlob);
            });
        },
        exportSvg: (name, options) => {
            return app.getSvg(options).then(svgBlob => {
                return blobToFile(svgBlob, `${name || "export"}.svg`);
            });
        },

        // 
        // Image API
        //
        getImage: options => {
            return new Promise((resolve, reject) => {
                // Initialize canvas to render SVG image
                const canvas = document.createElement("canvas");
                canvas.width = options?.cropWidth || state.width;
                canvas.height = options?.cropHeight || state.height;
                // Initialize image
                const img = new Image();
                img.addEventListener("load", () => {
                    const x = (-1) * (options?.cropX || 0);
                    const y = (-1) * (options?.cropY || 0);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, x, y);
                    // return resolve(canvas.toDataURL("image/png"));
                    canvas.toBlob(resolve);
                });
                img.addEventListener("error", event => {
                    return reject(event);
                });
                // Load image
                app.getSvg(options).then(svgBlob => {
                    img.src = window.URL.createObjectURL(svgBlob);
                });
            });
        },
        copyImage: options => {
            return app.getImage(options).then(imageBlob => {
                return blobToClipboard(imageBlob);
            });
        },
        exportImage: (name, options) => {
            return app.getImage(options).then(imageBlob => {
                return blobToFile(imageBlob, `${name || "export"}.png`);
            });
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
                        ...(elementConfig.initialize?.(state.style) || {}),
                        x1: getPosition(event.originalX),
                        y1: getPosition(event.originalY),
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
                        element.x1 = getPosition(element.x1 + info.dx),
                        element.x2 = getPosition(element.x2 + info.dx),
                        element.y1 = getPosition(element.y1 + info.dy),
                        element.y2 = getPosition(element.y2 + info.dy),
                        getElementConfig(element)?.onDrag?.(snapshot[index], event);
                    });
                }
                else if (state.activeAction === ACTIONS.RESIZE) {
                    state.isResized = true;
                    const element = app.getElement(snapshot[0].id);
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy), snapshot[0].y2 - 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy), snapshot[0].y1 + 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx), snapshot[0].x2 - 1);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx), snapshot[0].x1 + 1);
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
                }
                else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                    const element = state.activeElement;
                    element.selected = true; // By default select this element
                    getElementConfig(activelement)?.onCreateEnd?.(element, event);
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
                        copyTextToClipboard(data).then(() => {
                            // console.log("Copied to clipboard");
                        });
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
                    // TODO: copy image
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
                state.translateX = Math.floor((size.width - state.width) / 2);
                state.translateY = Math.floor((size.height - state.height) / 2);
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
