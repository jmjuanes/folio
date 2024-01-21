import {uid} from "uid/secure";
import {
    CHANGES,
    ELEMENTS,
    GRID_SIZE,
    ZOOM_DEFAULT,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    DEFAULTS,
    TEXT_BOX_MIN_WIDTH,
    STATES,
    PASTE_OFFSET,
    FIELDS,
} from "@lib/constants.js";
import {BACKGROUND_COLORS} from "@lib/utils/colors.js";
import {getElementConfig, createNewElement} from "@elements/index.jsx";
import {getRectangleBounds} from "@lib/utils/math.js";
import {loadImage} from "@lib/utils/image.js";
import {
    getTextFromClipboard,
    copyTextToClipboard,
    getTextFromClipboardItem,
    getBlobFromClipboardItem,
} from "@lib/utils/clipboard.js";

const generateRandomId = () => uid(20);

// Create a new board instance
export const createBoard = props => ({
    id: generateRandomId(),
    title: props.data?.title || "Untitled",
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
    background: props.data?.background || BACKGROUND_COLORS.gray,
    lockTool: false,
    selection: null,
    erase: null,
    defaults: {
        fillColor: DEFAULTS.FILL_COLOR,
        fillStyle: DEFAULTS.FILL_STYLE,
        strokeWidth: DEFAULTS.STROKE_WIDTH,
        strokeColor: DEFAULTS.STROKE_COLOR,
        strokeStyle: DEFAULTS.STROKE_STYLE,
        textColor: DEFAULTS.TEXT_COLOR,
        textFont: DEFAULTS.TEXT_FONT,
        textSize: DEFAULTS.TEXT_SIZE,
        textAlign: DEFAULTS.TEXT_ALIGN,
        shape: DEFAULTS.SHAPE,
        startArrowhead: DEFAULTS.ARROWHEAD_START,
        endArrowhead: DEFAULTS.ARROWHEAD_END,
        opacity: DEFAULTS.OPACITY,
        [FIELDS.NOTE_COLOR]: DEFAULTS.NOTE_COLOR,
    },
    state: {
        contextMenuVisible: false,
        contextMenuX: 0,
        contextMenuY: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        presentationMode: false,
    },

    update() {
        return props?.onUpdate?.();
    },
    clear() {
        this.elements = [];
        this.assets = {};
        this.clearHistory();
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
            ...createNewElement(type),
            [FIELDS.ORDER]: this.elements.length,
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
            const numElements = this.elements.length;
            // 1. Fix elements positions
            elements.forEach((element, index) => {
                element[FIELDS.ORDER] = numElements + index;
            });
            // 2. Register element create in the history
            this.addHistory({
                type: CHANGES.CREATE,
                elements: elements.map((element, index) => ({
                    id: element.id,
                    prevValues: null,
                    newValues: {
                        ...element,
                        selected: false,
                    },
                })),
            });
            // 3. Add new elements
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
            // 3. Reset elements order
            this.elements.forEach((element, index) => {
                element[FIELDS.ORDER] = index;
            });
        }
    },
    updateElements(elements, keys, values, groupChanges = true) {
        // 0. Get elements to update
        const elementsToChange = (elements || []).filter(el => {
            return keys.every(key => {
                if (typeof el[key] !== "undefined") {
                    const isValueAllowed = getElementConfig(el)?.isValueAllowed;
                    if (typeof isValueAllowed !== "function" || values.every(v => isValueAllowed(key, v))) {
                        return true;
                    }
                }
                // Default: not allowed to change
                return false;
            });
        });
        if (elementsToChange.length > 0) {
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
        const numElements = this.elements.length;
        const newElements = elements.map((element, index) => {
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
                [FIELDS.ORDER]: numElements + index,
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
    changeElementsOrder(elements, sign, absolute) {
        const changedElements = new Set();
        const prevElementsPosition = new Map();
        const nextElementsPosition = new Map();
        const length = this.elements.length;
        // 1. Save current elements position
        this.elements.forEach(element => {
            prevElementsPosition.set(element.id, element[FIELDS.ORDER]);
        });
        // 2. Fix order position of elements using the sign
        (elements || [])
            .sort((a, b) => sign * (b[FIELDS.ORDER] - a[FIELDS.ORDER]))
            .filter((el, index) => {
                return absolute || (sign > 0 ? el[FIELDS.ORDER] < length - 1 - index : el[FIELDS.ORDER] > index);
            })
            .forEach(element => {
                // move all elements to front or back
                if (absolute) {
                    element[FIELDS.ORDER] = element[FIELDS.ORDER] + 10 * sign * length;
                }
                // move only individual elements
                else {
                    // 2.1. Get the new position of the element
                    const newPosition = element[FIELDS.ORDER] + sign;
                    const nextElement = this.elements[newPosition];
                    // 2.2. Set the new position
                    element[FIELDS.ORDER] = newPosition;
                    nextElement[FIELDS.ORDER] = newPosition - sign;
                    // 2.3. Sort elements by order
                    this.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                    // 2.4. Set both elements as changed
                    changedElements.add(element.id);
                    changedElements.add(nextElement.id);
                }
            });
        // 3. Fix order in case of moving all elements to front or back
        if (absolute) {
            this.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
            this.elements.forEach((element, index) => {
                element[FIELDS.ORDER] = index;
                changedElements.add(element.id);
            });
        }
        // 4. Get new positions
        this.elements.forEach(element => {
            nextElementsPosition.set(element.id, element[FIELDS.ORDER]);
        });
        // 5. Register history change
        this.addHistory({
            type: CHANGES.UPDATE,
            elements: Array.from(changedElements).map(id => ({
                id: id,
                prevValues: {
                    [FIELDS.ORDER]: prevElementsPosition.get(id),
                },
                newValues: {
                    [FIELDS.ORDER]: nextElementsPosition.get(id),
                },
            })),
        });
    },
    bringElementsForward(elements) {
        return this.changeElementsOrder(elements, +1, false);
    },
    sendElementsBackward(elements) {
        return this.changeElementsOrder(elements, -1, false);
    },
    bringElementsToFront(elements) {
        return this.changeElementsOrder(elements, +1, true);
    },
    sendElementsToBack(elements) {
        return this.changeElementsOrder(elements, -1, true);
    },
    lockElements(elements) {
        // 1. Get elements to lock
        const elementsToUpdate = elements.filter(el => !el.locked);
        // 2. Register history change
        this.addHistory({
            type: CHANGES.UPDATE,
            elements: elementsToUpdate.map(element => ({
                id: element.id,
                prevValues: {
                    [FIELDS.LOCKED]: false,
                },
                newValues: {
                    [FIELDS.LOCKED]: true,
                },
            })),
        });
        // 3. Lock all provided elements
        elementsToUpdate.forEach(element => element[FIELDS.LOCKED] = true);
    },
    unlockElements(elements) {
        // 1. Get elements to unlock
        const elementsToUpdate = elements.filter(el => el.locked);
        // 2. Register history change
        this.addHistory({
            type: CHANGES.UPDATE,
            elements: elementsToUpdate.map(element => ({
                id: element.id,
                prevValues: {
                    [FIELDS.LOCKED]: true,
                },
                newValues: {
                    [FIELDS.LOCKED]: false,
                },
            })),
        });
        // 3. Unlock all provided elements
        elementsToUpdate.forEach(element => element[FIELDS.LOCKED] = false);
    },
    addText(text, tx = null, ty = null) {
        this.clearSelectedElements();
        const x = tx ?? (this.translateX + this.state.canvasWidth / 2);
        const y = ty ?? (this.translateY + this.state.canvasHeight / 2);
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
            const x = tx ?? (this.translateX + this.state.canvasWidth / 2);
            const y = ty ?? (this.translateY + this.state.canvasHeight / 2);
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
        // const selectedGroups = new Set();
        this.elements.forEach(element => {
            element.selected = false;
            if (!element.locked) {
                if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                    if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                        element.selected = true;
                        // Check if this element has a group for adding this element to the selected groups list
                        // if (!this.activeGroup && element.group) {
                        //     selectedGroups.add(element.group);
                        // }
                    }
                }
            }
        });
        // Select other elements in the group
        // this.elements.forEach(element => {
        //     if (element.group && selectedGroups.has(element.group)) {
        //         element.selected = true;
        //     }
        // })
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
    sendSelectedElementsBackward() {
        return this.sendElementsBackward(this.getSelectedElements());
    },
    bringSelectedElementsForward() {
        return this.bringElementsForward(this.getSelectedElements());
    },
    bringSelectedElementsToFront() {
        return this.bringElementsToFront(this.getSelectedElements());
    },
    sendSelectedElementsToBack() {
        return this.sendElementsToBack(this.getSelectedElements());
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
                // We need to restore elements in the current order
                entry.elements.forEach(el => {
                    this.elements.splice(el.prevValues[FIELDS.ORDER], 0, {...el.prevValues});
                });
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
            // Sort elements by order
            this.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
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
                entry.elements.forEach(el => {
                    this.elements.splice(el.newValues[FIELDS.ORDER], 0, {...el.newValues});
                });
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
            // sort elements by order
            this.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
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
        this.translateX = Math.floor(this.translateX + this.state.canvasWidth * (prevZoom - nextZoom) / 2);
        this.translateY = Math.floor(this.translateY + this.state.canvasHeight * (prevZoom - nextZoom) / 2);
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
