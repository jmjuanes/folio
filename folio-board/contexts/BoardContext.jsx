import React from "react";
import {uid} from "uid/secure";
import {
    ELEMENTS,
    GRID_SIZE,
    ZOOM_DEFAULT,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    FONT_FACES,
    getElementConfig,
    DEFAULT_FILL_COLOR,
    DEFAULT_FILL_OPACITY,
    DEFAULT_STROKE_COLOR,
    DEFAULT_STROKE_STYLE,
    DEFAULT_STROKE_OPACITY,
    DEFAULT_STROKE_WIDTH,
    DEFAULT_TEXT_COLOR,
    DEFAULT_TEXT_SIZE,
    DEFAULT_TEXT_FONT,
    DEFAULT_TEXT_ALIGN,
    DEFAULT_ARROWHEAD_END,
    DEFAULT_ARROWHEAD_START,
    DEFAULT_SHAPE,
} from "folio-core";
import {CHANGES, DEFAULT_BACKGROUND} from "../constants.js";
import {loadImage} from "../utils/image.js";

const generateRandomId = () => uid(20);

const createBoard = props => ({
    id: generateRandomId(),
    elements: (props.state?.elements || []).map(element => ({
        ...element,
        selected: false,
        editing: false,
        creating: false,
    })),
    assets: {
        ...props.state?.assets,
    },
    history: [],
    historyIndex: 0,
    activeAction: null,
    activeTool: null,
    activeElement: null,
    zoom: props.state?.zoom ?? ZOOM_DEFAULT,
    translateX: props.state?.translateX ?? 0,
    translateY: props.state?.translateY ?? 0,
    grid: props.state?.grid ?? true,
    background: props.state?.background ?? DEFAULT_BACKGROUND,
    selection: null,
    defaults: {
        fillColor: DEFAULT_FILL_COLOR,
        fillOpacity: DEFAULT_FILL_OPACITY,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        strokeColor: DEFAULT_STROKE_COLOR,
        strokeStyle: DEFAULT_STROKE_STYLE,
        strokeOpacity: DEFAULT_STROKE_OPACITY,
        textColor: DEFAULT_TEXT_COLOR,
        textFont: DEFAULT_TEXT_FONT,
        textSize: DEFAULT_TEXT_SIZE,
        textAlign: DEFAULT_TEXT_ALIGN,
        shape: DEFAULT_SHAPE,
        startArrowhead: DEFAULT_ARROWHEAD_START,
        endArrowhead: DEFAULT_ARROWHEAD_END,
    },
    
    update() {
        return props?.onUpdate?.();
    },

    copy() {
        const elements = this.getSelectedElements();
        const allAssets = this.assets;
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
    paste(data) {
        // We need to register the provided assets in the new assets object
        // To prevent different assets ids, we will use a map to convert provided assets Ids to new assets ids
        const assetMap = {};
        Object.values(data?.assets || {}).forEach(asset => {
            if (asset && asset.id && asset.dataUrl) {
                assetMap[asset.id] = this.addAsset(asset.dataUrl, asset.type);
            }
        });
        // Paste provided elements
        this.pasteElements((data?.elements || []).map(originalElement => {
            const element = {...originalElement};
            if (!!element.assetId && !!assetMap[element.assetId]) {
                element.assetId = assetMap[element.assetId];
            }
            return element;
        }));
    },
    getAsset(id) {
        return this.assets[id] || null;
    },
    getAssetData(id) {
        return this.assets[id]?.dataUrl || "";
    },
    addAsset(data) {
        // First we need to check if this asset is already registered
        let assetId = Object.keys(this.assets).find(assetId => {
            return this.assets[assetId]?.dataUrl === data;
        });
        if (!assetId) {
            // Register this asset using a new identifier
            assetId = generateRandomId();
            this.assets[assetId] = {
                id: assetId,
                createdAt: Date.now(),
                type: data.substring(data.indexOf(":") + 1, data.indexOf(";")),
                size: data.length,
                dataUrl: data,
            };
        }
        return assetId;
    },
    getElement(id) {
        return this.elements.find(el => el.id === id);
    },
    createElement(type) {
        return {
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
        };
    },
    getElements() {
        return this.elements;
    },
    clearElements() {
        this.elements = [];
        this.clearHistory();
    },
    addElements(elements) {
        if (elements && elements.length > 0) {
            // 1. Register element create in the history
            this.addHistory({
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
            elements.forEach(element => this.elements.push(element));
        }
    },
    removeElements(elements) {
        if (elements && elements.length > 0) {
            // 1. Register element remove in the history
            this.addHistory({
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
            // 2. Remove the elements for this.elements
            const elementsToRemove = new Set(elements.map(element => element.id));
            this.elements = this.elements.filter(element => {
                return !elementsToRemove.has(element.id);
            });
        }
    },
    updateElements(elements, keys, values, groupChanges = true) {
        if (elements && elements.length > 0) {
            // 1. Register element update in the history
            this.addHistory({
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
            const changedKeys = new Set(keys);
            elements.forEach(element => {
                keys.forEach((key, index) => element[key] = values[index]);
                getElementConfig(element)?.onUpdate?.(element, changedKeys);
            });
        }
        // 3. Update defaults
        keys.forEach((key, index) => {
            this.defaults[key] = values[index];
        });
    },
    pasteElements(elements) {
        this.clearSelectedElements();
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
        newElements.forEach(element => this.elements.push(element));
        // 3. register history change
        this.addHistory({
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
    addText(text) {
        this.clearSelectedElements();
        const target = document.querySelector(`svg[data-id="${this.id}"]`);
        const size = target?.getBoundingClientRect?.() || {};
        const x = this.translateX + (size.width || 0)/ 2;
        const y = this.translateY + (size.height || 0) / 2;
        const element = this.createElement(ELEMENTS.TEXT);
        const elementConfig = getElementConfig(element);

        // We need to assign initial text values to this element
        Object.assign(element, {
            ...(elementConfig.initialize?.(this.defaults) || {}),
            text: text,
            selected: true,
        });

        const textSize = (element.textSize ?? 0) + "px";
        const textFont = element.textFont ?? FONT_FACES.SANS;
        const [textWidth, textHeight] = elementConfig.utils.measureText(text, textSize, textFont);
        // Override element position
        Object.assign(element, {
            x1: Math.floor((x - textWidth / 2) / GRID_SIZE) * GRID_SIZE,
            y1: Math.floor((y - textHeight / 2) / GRID_SIZE) * GRID_SIZE,
            x2: Math.ceil((x + textWidth / 2) / GRID_SIZE) * GRID_SIZE,
            y2: Math.ceil((y + textHeight / 2) / GRID_SIZE) * GRID_SIZE,
            textWidth: textWidth,
            textHeight: textHeight,
            minWidth: Math.ceil(textWidth / GRID_SIZE) * GRID_SIZE,
            minHeight: Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE,
        });
        this.addElements([element]);
        this.update();
        return Promise.resolve(element);
    },
    addImage(image, type) {
        this.clearSelectedElements();
        return loadImage(image).then(img => {
            const target = document.querySelector(`svg[data-id="${this.id}"]`);
            const size = target?.getBoundingClientRect?.() || {};
            const x = this.translateX + (size.width || 0)/ 2;
            const y = this.translateY + (size.height || 0) / 2;
            const element = this.createElement(ELEMENTS.IMAGE);
            const elementConfig = getElementConfig(element);
            Object.assign(element, {
                ...(elementConfig.initialize?.(this.defaults) || {}),
                assetId: this.addAsset(image, type),
                // image: image,
                imageWidth: img.width,
                imageHeight: img.height,
                x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                selected: true,
            });
            this.addElements([element]);
            this.update();
            return element;
        });
    },
    getSelectedElements() {
        return this.elements.filter(el => !!el.selected);
    },
    clearSelectedElements() {
        return this.elements.forEach(el => el.selected = false);
    },
    setSelectedElements(selection) {
        return this.elements.forEach(element => {
            element.selected = false;
            if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                    element.selected = true;
                }
            }
        });
    },
    removeSelectedElements() {
        return this.removeElements(this.getSelectedElements());
    },
    snapshotSelectedElements() {
        return this.getSelectedElements().map(el => ({...el}));
    },
    updateSelectedElements(key, value) {
        return this.updateElements(this.getSelectedElements(), [key], [value], false);
    },
    cloneSelectedElements() {
        return this.pasteElements(this.snapshotSelectedElements());
    },
    getHistory() {
        return [...this.history];
    },
    setHistory(newHistory) {
        this.history = newHistory || [];
        this.historyIndex = 0;
    },
    clearHistory() {
        return this.setHistory([]);
    },
    addHistory(entry) {
        if (this.historyIndex > 0) {
            this.history = this.history.slice(this.historyIndex);
            this.historyIndex = 0;
        }
        // Check for updating the same elements and the same keys
        if (entry.keys && entry.ids && this.history.length > 0) {
            const last = this.history[0];
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
        this.history.unshift(entry);
    },
    undo() {
        if (this.historyIndex < this.history.length) {
            const entry = this.history[this.historyIndex];
            if (entry.type === CHANGES.CREATE) {
                const removeElements = new Set(entry.elements.map(el => el.id));
                this.elements = this.elements.filter(el => !removeElements.has(el.id));
            } else if (entry.type === CHANGES.REMOVE) {
                entry.elements.forEach(el => this.elements.unshift({...el.prevValues}));
            } else if (entry.type === CHANGES.UPDATE) {
                entry.elements.forEach(item => {
                    // 1. Update element values
                    const element = this.elements.find(el => el.id === item.id);
                    Object.assign(element, item.prevValues);
                    // 2. Apply element update
                    const changedKeys = new Set(Object.keys(item.prevValues));
                    getElementConfig(element)?.onUpdate?.(element, changedKeys);
                });
            }
            this.historyIndex = this.historyIndex + 1;
            this.setAction(null);
            // this.state.activeGroup = null;
            this.elements.forEach(el => {
                el.selected = false;
                el.editing = false;
            });
            this.update();
        }
    },
    redo() {
        if (this.historyIndex > 0 && this.history.length > 0) {
            this.historyIndex = this.historyIndex - 1;
            const entry = this.history[this.historyIndex];
            if (entry.type === CHANGES.CREATE) {
                entry.elements.forEach(el => this.elements.unshift({...el.newValues}));
            } else if (entry.type === CHANGES.REMOVE) {
                const removeElements = new Set(entry.elements.map(el => el.id));
                this.elements = this.elements.filter(el => !removeElements.has(el.id));
            } else if (entry.type === CHANGES.UPDATE) {
                entry.elements.forEach(item => {
                    // 1. Update element values
                    const element = this.elements.find(el => el.id === item.id);
                    Object.assign(element, item.newValues);
                    // 2. Apply element update
                    const changedKeys = new Set(Object.keys(item.newValues));
                    getElementConfig(element)?.onUpdate?.(element, changedKeys);
                });
            }
            this.setAction(null);
            // this.state.activeGroup = null;
            this.elements.forEach(el => {
                el.selected = false;
                el.editing = false;
            });
            this.update();
        }
    },
    isUndoDisabled() {
        return this.historyIndex >= this.history.length;
    },
    isRedoDisabled() {
        return this.historyIndex === 0 || this.history.length < 1;
    },
    getZoom() {
        return this.zoom;
    },
    setZoom(value) {
        const prevZoom = this.zoom;
        const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
        const target = document.querySelector(`svg[data-id="${this.id}"]`);
        const size = target?.getBoundingClientRect?.() || {};
        this.translateX = Math.floor(this.translateX + (size.width || 0) * (prevZoom - nextZoom) / 2);
        this.translateY = Math.floor(this.translateY + (size.height || 0) * (prevZoom - nextZoom) / 2);
        this.zoom = nextZoom;
        this.update();
    },
    zoomIn() {
        return this.setZoom(this.zoom + ZOOM_STEP);
    },
    zoomOut() {
        return this.setZoom(this.zoom - ZOOM_STEP);
    },
    setTool(newTool) {
        this.setAction(null);
        this.activeTool = newTool;
    },
    setAction(newAction) {
        // Disable editing in all elements of the board
        this.elements.forEach(element => {
            element.editing = false;
            element.selected = false;
        });
        this.activeElement = null;
        this.activeAction = newAction;
    },
});

export const BoardContext = React.createContext({});

export const useBoard = () => {
    return React.useContext(BoardContext)?.current;
};

export const BoardProvider = props => {
    const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = React.useRef(null);

    if (!board.current) {
        board.current = createBoard({
            state: props.initialState || {},
            onUpdate: forceUpdate,
        });
    }

    return (
        <BoardContext.Provider value={board}>
            {props.render()}
        </BoardContext.Provider>
    );
};

BoardProvider.defaultProps = {
    initialState: {},
    render: null,
};
