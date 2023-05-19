import {uid} from "uid/secure";
import {
    BACKGROUND_COLORS,
    ELEMENTS,
    GRID_SIZE,
    ZOOM_DEFAULT,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    DEFAULT_FILL_COLOR,
    DEFAULT_STROKE_COLOR,
    DEFAULT_STROKE_STYLE,
    DEFAULT_STROKE_WIDTH,
    DEFAULT_TEXT_COLOR,
    DEFAULT_TEXT_SIZE,
    DEFAULT_TEXT_FONT,
    DEFAULT_TEXT_ALIGN,
    DEFAULT_ARROWHEAD_END,
    DEFAULT_ARROWHEAD_START,
    DEFAULT_SHAPE,
    TEXT_BOX_MIN_WIDTH,
    DEFAULT_OPACITY,
    DEFAULT_BLUR,
} from "folio-core";
import {getElementConfig, getRectangleBounds} from "folio-core";
import {CHANGES, STATES, PASTE_OFFSET} from "./constants.js";
import {loadImage} from "./utils/image.js";
import {getTextFromClipboard, copyTextToClipboard} from "./utils/clipboard.js";
import {getTextFromClipboardItem, getBlobFromClipboardItem} from "./utils/clipboard.js";

const generateRandomId = () => uid(20);

// Create a new board instance
export const createBoard = props => ({
    id: generateRandomId(),
    elements: (props.data?.elements || []).map(element => ({
        ...element,
        selected: false,
        editing: false,
        creating: false,
    })),
    assets: {
        ...props.data?.assets,
    },
    history: [],
    historyIndex: 0,
    currentState: STATES.IDLE,
    activeAction: null,
    activeTool: null,
    activeElement: null,
    activeGroup: null,
    zoom: ZOOM_DEFAULT,
    translateX: 0,
    translateY: 0,
    grid: props.data?.grid ?? false,
    background: props.data?.background || BACKGROUND_COLORS.GRAY,
    lockTool: false,
    selection: null,
    erase: null,
    defaults: {
        fillColor: DEFAULT_FILL_COLOR,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        strokeColor: DEFAULT_STROKE_COLOR,
        strokeStyle: DEFAULT_STROKE_STYLE,
        textColor: DEFAULT_TEXT_COLOR,
        textFont: DEFAULT_TEXT_FONT,
        textSize: DEFAULT_TEXT_SIZE,
        textAlign: DEFAULT_TEXT_ALIGN,
        shape: DEFAULT_SHAPE,
        startArrowhead: DEFAULT_ARROWHEAD_START,
        endArrowhead: DEFAULT_ARROWHEAD_END,
        opacity: DEFAULT_OPACITY,
        blur: DEFAULT_BLUR,
    },
    state: {
        contextMenuVisible: false,
        contextMenuX: 0,
        contextMenuY: 0,
    },

    update() {
        return props?.onUpdate?.();
    },
    export(elementsToExport) {
        const elements = elementsToExport || this.elements;
        return {
            elements: elements,
            assets: elements.reduce((assets, element) => {
                // Copy only assets in the current selection
                if (element.assetId && this.assets[element.assetId]) {
                    assets[element.assetId] = this.assets[element.assetId];
                }
                return assets;
            }, {}),
        };
    },
    copy(elementsToCopy) {
        const elements = elementsToCopy || this.getSelectedElements();
        const data = this.export(elements);  
        return copyTextToClipboard(`folio:::${JSON.stringify(data)}`);
    },
    cut(elements) {
        return this.copy(elements).then(() => {
            return this.removeSelectedElements();
        });
    },
    paste(event, point) {
        const x = point ? (point.x - this.translateX) / this.zoom : null;
        const y = point ? (point.y - this.translateY) / this.zoom : null;
        // Tiny function to parse text data
        const parseTextData = content => {
            if (typeof content === "string") {
                if (content?.startsWith("folio:::")) {
                    const data = JSON.parse(content.split("folio:::")[1].trim());
                    // We need to register the provided assets in the new assets object
                    // To prevent different assets ids, we will use a map to convert provided
                    // assets Ids to new assets ids
                    const assetMap = {};
                    Object.values(data?.assets || {}).forEach(asset => {
                        if (asset && asset.id && asset.dataUrl) {
                            assetMap[asset.id] = this.addAsset(asset.dataUrl, asset.type);
                        }
                    });
                    // Paste provided elements
                    const elements = (data?.elements || []).map(originalElement => {
                        const element = {...originalElement};
                        if (!!element.assetId && !!assetMap[element.assetId]) {
                            element.assetId = assetMap[element.assetId];
                        }
                        return element;
                    });
                    const bounds = getRectangleBounds(data?.elements || []);
                    const dx = point ? x - bounds.x1 : 0;
                    const dy = point ? y - bounds.y1 : 0;
                    this.pasteElements(elements, dx, dy);
                    this.update();
                    return Promise.resolve(true);
                }
                // Create a new text element
                return this.addText(content, x, y);
            }
            // No valid text, reject promise
            return Promise.reject(null);
        };

        // Check for paste event
        if (event?.clipboardData) {
            const clipboardItems = event.clipboardData?.items || [];
            for (let i = 0; i < clipboardItems.length; i++) {
                const item = clipboardItems[i];
                // Check for image data (image/png, image/jpg)
                if (item.type.startsWith("image/")) {
                    return getBlobFromClipboardItem(item).then(content => {
                        return this.addImage(content, x, y);
                    });
                }
                // Check for text data
                else if (item.type === "text/plain") {
                    return getTextFromClipboardItem(item).then(content => {
                        return parseTextData(content);
                    });
                }
            }
        }
        // If not, check clipboard
        else {
            return getTextFromClipboard().then(content => {
                return parseTextData(content);
            });
        }
        // Other case, no data to paste
        return Promise.reject(null);
    },
    duplicate() {
        const elements = this.snapshotSelectedElements();
        const bounds = getRectangleBounds(elements);
        const dx = (bounds.x2 + PASTE_OFFSET) - bounds.x1;
        this.pasteElements(elements, dx, 0);
    },
    remove() {
        this.removeSelectedElements();
    },
    selectAll() {
        this.elements.forEach(el => el.selected = true);
        this.activeGroup = null;
    },
    selectNone() {
        this.elements.forEach(el => el.selected = false);
        this.activeGroup = null;
    },
    group(elementsToGroup) {
        const elements = elementsToGroup || this.getSelectedElements();
        this.updateElements(elements, ["group"], [generateRandomId()], false);
    },
    ungroup(elementsToUngroup) {
        const elements = elementsToUngroup || this.getSelectedElements();
        this.updateElements(elements, ["group"], [null], false);
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
                        erased: false,
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
            // 0. Get elements to update
            const elementsToChange = elements.filter(el => {
                return keys.every(key => typeof el[key] !== "undefined");
            });
            // 1. Register element update in the history
            this.addHistory({
                type: CHANGES.UPDATE,
                ids: groupChanges && elementsToChange.map(element => element.id).join(","),
                keys: groupChanges && keys.join(","),
                elements: elementsToChange.map(element => ({
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
            elementsToChange.forEach(element => {
                keys.forEach((key, index) => element[key] = values[index]);
                getElementConfig(element)?.onUpdate?.(element, changedKeys);
            });
        }
        // 3. Update defaults
        keys.forEach((key, index) => {
            this.defaults[key] = values[index];
        });
    },
    pasteElements(elements, dx = 0, dy = 0) {
        this.clearSelectedElements();
        // 1. Process new elements
        const groups = new Map();
        const newElements = elements.map(element => {
            // 1.1. Check if this element is part of a group
            if (elements.length > 1 && !!element.group && !groups.has(element.group)) {
                groups.set(element.group, generateRandomId());
            }
            // 1.2. Return new element data
            return {
                ...element,
                id: generateRandomId(),
                x1: element.x1 + dx,
                x2: element.x2 + dx,
                y1: element.y1 + dy,
                y2: element.y2 + dy,
                selected: true,
                group: this.activeGroup || groups.get(element.group) || null,
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
    addText(text, tx = null, ty = null) {
        this.clearSelectedElements();
        const target = document.querySelector(`svg[data-id="${this.id}"]`);
        const size = target?.getBoundingClientRect?.() || {};
        const x = tx ?? (this.translateX + (size.width || 0)/ 2);
        const y = ty ?? (this.translateY + (size.height || 0) / 2);
        const element = this.createElement(ELEMENTS.TEXT);
        const elementConfig = getElementConfig(element);

        // We need to assign initial text values to this element
        Object.assign(element, {
            ...(elementConfig.initialize?.(this.defaults) || {}),
            text: text,
            selected: true,
            group: this.activeGroup || null,
        });

        const textSize = element.textSize ?? 0;
        const textFont = element.textFont ?? "";
        const [textWidth, textHeight] = elementConfig.utils.measureText(text || " ", textSize, textFont, `${TEXT_BOX_MIN_WIDTH}px`);
        // Override element position
        Object.assign(element, {
            x1: Math.floor((x - textWidth / 2) / GRID_SIZE) * GRID_SIZE,
            y1: Math.floor((y - textHeight / 2) / GRID_SIZE) * GRID_SIZE,
            x2: Math.ceil((x + textWidth / 2) / GRID_SIZE) * GRID_SIZE,
            y2: Math.ceil((y + textHeight / 2) / GRID_SIZE) * GRID_SIZE,
            textWidth: textWidth,
            textHeight: textHeight,
        });
        this.addElements([element]);
        this.update();
        return Promise.resolve(element);
    },
    addImage(image, tx = null, ty = null) {
        this.clearSelectedElements();
        return loadImage(image).then(img => {
            const target = document.querySelector(`svg[data-id="${this.id}"]`);
            const size = target?.getBoundingClientRect?.() || {};
            const x = tx ?? (this.translateX + (size.width || 0)/ 2);
            const y = ty ?? (this.translateY + (size.height || 0) / 2);
            const element = this.createElement(ELEMENTS.IMAGE);
            const elementConfig = getElementConfig(element);
            Object.assign(element, {
                ...(elementConfig.initialize?.(this.defaults) || {}),
                assetId: this.addAsset(image),
                // image: image,
                imageWidth: img.width,
                imageHeight: img.height,
                x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                selected: true,
                group: this.activeGroup || null,
            });
            this.addElements([element]);
            this.update();
            return element;
        });
    },
    getGroupElements(group) {
        return this.elements.filter(el => el.group === group);
    },
    getActiveGroupElements() {
        return this.activeGroup ? this.getGroupElements(this.activeGroup) : [];
    },
    getSelectedElements() {
        return this.elements.filter(el => !!el.selected);
    },
    clearSelectedElements() {
        return this.elements.forEach(el => el.selected = false);
    },
    setSelectedElements(selection) {
        const selectedGroups = new Set();
        this.elements.forEach(element => {
            element.selected = false;
            if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                    element.selected = true;
                    // Check if this element has a group for adding this element to the selected groups list
                    if (!this.activeGroup && element.group) {
                        selectedGroups.add(element.group);
                    }
                }
            }
        });
        // Select other elements in the group
        this.elements.forEach(element => {
            if (element.group && selectedGroups.has(element.group)) {
                element.selected = true;
            }
        })
    },
    removeSelectedElements() {
        this.removeElements(this.getSelectedElements());
        // Make sure we exit active group if there are no more elements on this group
        if (this.activeGroup && this.elements.every(el => el.group !== this.activeGroup)) {
            this.activeGroup = null;
        }
    },
    snapshotSelectedElements() {
        return this.getSelectedElements().map(el => ({...el}));
    },
    updateSelectedElements(key, value) {
        return this.updateElements(this.getSelectedElements(), [key], [value], false);
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
            this.activeGroup = null;
            this.setAction(null);
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
            this.activeGroup = null;
            this.setAction(null);
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
        this.state.contextMenuVisible = false;
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
        this.clearSelectedElements();
        this.activeTool = newTool;
        this.state.contextMenuVisible = false;
    },
    setAction(newAction) {
        // Disable editing in all elements of the board
        this.elements.forEach(element => {
            element.editing = false;
            // element.selected = false;
        });
        this.activeElement = null;
        this.activeAction = newAction;
        this.state.contextMenuVisible = false;
    },
});

export const isGroupVisible = board => {
    const selectedElements = board.getSelectedElements();
    const selectedGroups = new Set(selectedElements.map(el => el.group));
    return !board.activeGroup && selectedElements.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
};

export const isUngroupVisible = board => {
    const selectedElements = board.getSelectedElements();
    return !board.activeGroup && selectedElements.some(el => !!el.group);
};
