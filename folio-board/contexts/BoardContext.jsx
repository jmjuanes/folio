import React from "react";
import {
    ELEMENTS,
    GRID_SIZE,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    getElementConfig,
} from "folio-core";
import {
    ACTIONS,
    CHANGES,
} from "../constants.js";
import {getDefaultState} from "../state.js";
import {fontSizes, fontFaces} from "../styles.js";
import {loadImage} from "../utils/image.js";
import {generateRandomId} from "../utils/stringUtils.js";

export const BoardContext = React.createContext({});
export const useBoard = () => {
    return React.useContext(BoardContext);
};

export const BoardProvider = props => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = React.useRef(null);

    if (!board.current) {
        board.current = {
            id: generateRandomId(),
            elements: [...props.elements].map(element => ({
                ...element,
                selected: false,
            })),
            assets: {...props.assets},
            state: getDefaultState(),
            history: [],
            historyIndex: 0,
            action: null,
            tool: null,
            zoom: 1,
            translateX: 0,
            translateY: 0,
            selection: null,
            background: "#fafafa",
            grid: true,
        
            update: () => forceUpdate(),
            reset: () => {
                board.current.elements = [];
                // board.current.assets = {};
                board.current.history = [];
                board.current.historyIndex = 0;
            },
            copy: () => {
                const elements = board.current.getSelectedElements();
                const allAssets = board.current.assets;
                return {
                    elements: elements,
                    assets: elements.reduce((assets, element) => {
                        // Copy only assets in the current selection
                        if (element.assetId && allAssets[element.assetId]) {
                            assets[element.assetId] = allAssets[element.assetId];
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
                    assetMap[assetId] = board.current.addAsset(data.assets[assetId]);
                });
                // Paste provided elements
                board.current.pasteElements((data?.elements || []).map(originalElement => {
                    const element = {...originalElement};
                    if (!!element.assetId && !!assetMap[element.assetId]) {
                        element.assetId = assetMap[element.assetId];
                    }
                    return element;
                }));
            },

            //
            // Assets API
            //
            getAsset: assetId => {
                return board.current.assets[assetId] || "";
            },
            addAsset: data => {
                // First we need to check if this asset is already registered
                let assetId = Object.keys(board.current.assets).find(assetId => {
                    return board.current.assets[assetId] === data;
                });
                if (!assetId) {
                    // Register this asset using a new identifier
                    assetId = generateRandomId();
                    board.current.assets[assetId] = data;
                }
                return assetId;
            },

            //
            // Elements API
            //
            getElement: id => {
                return board.current.elements.find(el => el.id === id);
            },
            createElement: type => ({
                type: type,
                id: generateRandomId(),
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
            getElements: () => {
                return board.current.elements;
            },
            clearElements: () => {
                board.current.elements = [];
                board.current.clearHistory();
            },
            addElements: elements => {
                if (elements && elements.length > 0) {
                    // 1. Register element create in the history
                    board.current.addHistory({
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
                    elements.forEach(element => board.current.elements.push(element));
                }
            },
            removeElements: elements => {
                if (elements && elements.length > 0) {
                    // 1. Register element remove in the history
                    board.current.addHistory({
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
                    // 2. Remove the elements for board.current.elements
                    const elementsToRemove = new Set(elements.map(element => element.id));
                    board.current.elements = board.current.elements.filter(element => {
                        return !elementsToRemove.has(element.id);
                    });
                }
            },
            updateElements: (elements, keys, values, groupChanges = true) => {
                if (elements && elements.length > 0) {
                    // 1. Register element update in the history
                    board.current.addHistory({
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
                    if (typeof board.current.state.style[key] !== "undefined") {
                        board.current.state.style[key] = values[index];
                    }
                });
            },
            pasteElements: elements => {
                board.current.clearSelectedElements();
                // 1. Process new elements
                // const groups = new Map();
                const newElements = elements.map(element => {
                    // if (elements.length > 1 && !!element.group && !groups.has(element.group)) {
                    //     groups.set(element.group, generateRandomId());
                    // }
                    return {
                        ...element,
                        id: generateRandomId(),
                        selected: true,
                        // group: state.activeGroup || groups.get(element.group) || null,
                    };
                });
                // 2. insert new elements
                newElements.forEach(element => board.current.elements.push(element));
                // 3. register history change
                board.current.addHistory({
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
                board.current.clearSelectedElements();
                const state = board.current.state;
                const target = document.querySelector(`svg#${board.current.id}`);
                const size = target?.getBoundingClientRect() || {};
                const x = state.translateX + (size.width || 0)/ 2;
                const y = state.translateY + (size.height || 0) / 2;
                const element = board.current.createElement(ELEMENTS.TEXT);
                const elementConfig = getElementConfig(element);
                const textSize = fontSizes[state.style.textSize];
                const textFont = fontFaces[state.style.textFont];
                const [textWidth, textHeight] = elementConfig.utils.measureText(text, textSize, textFont);
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
                board.current.addElements([element]);
                return Promise.resolve(element);
            },
            addImage: image => {
                board.current.clearSelectedElements();
                return loadImage(image).then(img => {
                    const state = board.current.state;
                    const target = document.querySelector(`svg#${board.current.id}`);
                    const size = target?.getBoundingClientRect() || {};
                    const x = state.translateX + (size.width || 0)/ 2;
                    const y = state.translateY + (size.height || 0) / 2;
                    const element = board.current.createElement(ELEMENTS.IMAGE);
                    const elementConfig = getElementConfig(element);
                    Object.assign(element, {
                        ...(elementConfig.initialize?.(state.style) || {}),
                        assetId: board.current.addAsset(image),
                        // image: image,
                        imageWidth: img.width,
                        imageHeight: img.height,
                        x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                        y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                        x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                        y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                        selected: true,
                    });
                    board.current.addElements([element]);
                    return element;
                });
            },

            //
            // Elements selection API
            //
            getSelectedElements: () => {
                return board.current.elements.filter(el => !!el.selected);
            },
            clearSelectedElements: () => {
                return board.current.elements.forEach(el => el.selected = false);
            },
            setSelectedElements: selection => {
                return board.current.elements.forEach(element => {
                    element.selected = false;
                    if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                        if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                            element.selected = true;
                        }
                    }
                });
            },
            removeSelectedElements: () => {
                return board.current.removeElements(board.current.getSelectedElements());
            },
            snapshotSelectedElements: () => {
                return board.current.getSelectedElements().map(el => ({...el}));
            },
            updateSelectedElements: (key, value) => {
                return board.current.updateElements(board.current.getSelectedElements(), [key], [value], false);
            },
            cloneSelectedElements: () => {
                return board.current.pasteElements(board.current.snapshotSelectedElements());
            },

            //
            // History API
            //
            getHistory: () => {
                return [...board.current.history];
            },
            setHistory: newHistory => {
                board.current.history = newHistory || [];
                board.current.historyIndex = 0;
            },
            clearHistory: () => {
                return board.current.setHistory([]);
            },
            addHistory: entry => {
                if (board.current.historyIndex > 0) {
                    board.current.history = board.current.history.slice(board.current.historyIndex);
                    board.current.historyIndex = 0;
                }
                // Check for updating the same elements and the same keys
                if (entry.keys && entry.ids && board.current.history.length > 0) {
                    const last = board.current.history[0];
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
                board.current.history.unshift(entry);
            },
            undo: () => {
                if (board.current.historyIndex < board.current.history.length) {
                    const entry = board.current.history[board.current.historyIndex];
                    if (entry.type === CHANGES.CREATE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        board.current.elements = board.current.elements.filter(el => !removeElements.has(el.id));
                    } else if (entry.type === CHANGES.REMOVE) {
                        entry.elements.forEach(el => board.current.elements.unshift({...el.prevValues}));
                    } else if (entry.type === CHANGES.UPDATE) {
                        entry.elements.forEach(element => {
                            Object.assign(board.current.elements.find(el => el.id === element.id), element.prevValues);
                        });
                    }
                    board.current.historyIndex = board.current.historyIndex + 1;
                    board.current.setAction(null);
                    // board.current.state.activeGroup = null;
                    board.current.elements.forEach(el => el.selected = false);
                    board.current.update();
                }
            },
            redo: () => {
                if (board.current.historyIndex > 0 && board.current.history.length > 0) {
                    board.current.historyIndex = board.current.historyIndex - 1;
                    const entry = board.current.history[board.current.historyIndex];
                    if (entry.type === CHANGES.CREATE) {
                        entry.elements.forEach(el => board.current.elements.unshift({...el.newValues}));
                    } else if (entry.type === CHANGES.REMOVE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        board.current.elements = board.current.elements.filter(el => !removeElements.has(el.id));
                    } else if (entry.type === CHANGES.UPDATE) {
                        entry.elements.forEach(element => {
                            Object.assign(board.current.elements.find(el => el.id === element.id) || {}, element.newValues);
                        });
                    }
                    board.current.setAction(null);
                    // board.current.state.activeGroup = null;
                    board.current.elements.forEach(el => el.selected = false);
                    board.current.update();
                }
            },
            isUndoDisabled: () => {
                return board.current.historyIndex >= board.current.history.length;
            },
            isRedoDisabled: () => {
                return board.current.historyIndex === 0 || board.current.history.length < 1;
            },

            // 
            // Zoom API
            //
            getZoom: () => {
                return board.current.state.zoom;
            },
            setZoom: value => {
                // TODO: check for previous action or editing action
                // board.current.cancelAction();
                const prevZoom = board.current.zoom;
                const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
                const target = document.querySelector(`svg#${board.current.id}`);
                if (target) {
                    const size = target.getBoundingClientRect();
                    board.current.translateX = Math.floor(board.current.translateX + size.width * (prevZoom - nextZoom) / 2);
                    board.current.translateY = Math.floor(board.current.translateY + size.height * (prevZoom - nextZoom) / 2);
                    board.current.zoom = nextZoom;
                }
                board.current.update();
            },
            zoomIn: () => {
                return board.current.setZoom(board.current.zoom + ZOOM_STEP);
            },
            zoomOut: () => {
                return board.current.setZoom(board.current.zoom - ZOOM_STEP);
            },

            //
            // Tool API
            // 
            setTool: newTool => {
                board.current.setAction(null);
                board.current.clearSelectedElements();
                board.current.state.activeTool = newTool;
                // board.current.update();
            },

            //
            // Actions API
            //
            setAction: newAction => {
                board.current.elements.forEach(element => {
                    if (element.editing) {
                        element.editing = false;
                    }
                });
                // else if (state.activeAction === ACTIONS.CREATE && state.activeElement) {
                //     // TODO: remove element
                // }
                // state.activeElement = null;
                board.current.action = newAction;
                // state.activeTool = null;
            },
        };
    }

    return (
        <BoardContext.Provider value={board}>
            {props.children}
        </BoardContext.Provider>
    );
};

BoardProvider.defaultProps = {
    elements: [],
    assets: {},
    onChange: null,
};
