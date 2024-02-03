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
    FIELDS,
} from "@lib/constants.js";
import {BACKGROUND_COLORS} from "@lib/utils/colors.js";
import {getElementConfig, createNewElement} from "@elements/index.jsx";
import {loadImage} from "@lib/utils/image.js";

const generateRandomId = () => uid(20);

// Default values for new elements
const defaults = {
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
};

// Create a new scene object
export const createScene = initialData => ({
    id: initialData?.id || generateRandomId(),
    title: initialData?.title || "Untitled",
    width: initialData?.width ?? 0,
    height: initialData?.height ?? 0,
    elements: (initialData?.elements || []).map(element => ({
        ...element,
        selected: false,
        editing: false,
        creating: false,
    })),
    assets: initialData?.assets || {},
    history: initialData?.history || [],
    background: initialData?.background || BACKGROUND_COLORS.gray,
    defaults: {...defaults},
    state: {
        translateX: initialData?.state?.translateX || 0,
        translateY: initialData?.state?.translateY || 0,
        zoom: initialData?.state?.zoom || ZOOM_DEFAULT,
    },
});

// Manage scene methods
export const sceneActions = {
    // Export scene
    export: (scene, elementsToExport) => {
        const elements = elementsToExport || scene.elements;
        return {
            elements: elements,
            assets: elements.reduce((assets, element) => {
                // Copy only assets in the current selection
                if (element.assetId && scene.assets[element.assetId]) {
                    assets[element.assetId] = scene.assets[element.assetId];
                }
                return assets;
            }, {}),
        };
    },

    // 
    // Assets api
    //
    // @description Get an asset by ID
    getAsset: (scene, id) => {
        return scene.assets[id] || null;
    },
    // @description add a new asset
    addAsset: (scene, data) => {
        // First we need to check if this asset is already registered
        let assetId = Object.keys(scene.assets)
            .find(assetId => {
                return scene.assets[assetId]?.dataUrl === data;
            });
        if (!assetId) {
            // Register this asset using a new identifier
            assetId = generateRandomId();
            scene.assets[assetId] = {
                id: assetId,
                createdAt: Date.now(),
                type: data.substring(data.indexOf(":") + 1, data.indexOf(";")),
                size: data.length,
                dataUrl: data,
            };
        }
        return assetId;
    },

    //
    // Elements API
    // 
    getElement: (scene, id) => {
        return scene.elements.find(el => el.id === id);
    },
    createElement: (scene, type) => {
        return {
            ...createNewElement(type),
            [FIELDS.ORDER]: scene.elements.length,
        };
    },
    clearElements: (scene) => {
        scene.elements = [];
    },
    addElements: (scene, elements) => {
        if (elements && elements.length > 0) {
            const numElements = scene.elements.length;
            // 1. Fix elements positions
            elements.forEach((element, index) => {
                element[FIELDS.ORDER] = numElements + index;
            });
            // 2. Register element create in the history
            sceneActions.addHistory(scene, {
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
            elements.forEach(element => {
                return scene.elements.push(element);
            });
        }
    },
    removeElements: (scene, elements) => {
        if (elements && elements.length > 0) {
            // 1. Register element remove in the history
            sceneActions.addHistory(scene, {
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
            scene.elements = scene.elements.filter(element => {
                return !elementsToRemove.has(element.id);
            });
            // 3. Reset elements order
            scene.elements.forEach((element, index) => {
                element[FIELDS.ORDER] = index;
            });
        }
    },
    updateElements: (scene, elements, keys, values, groupChanges = true) => {
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
            sceneActions.addHistory(scene, {
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
            scene.defaults[key] = values[index];
        });
    },
    importElements: (scene, elements, dx = 0, dy = 0) => {
        sceneActions.clearSelection(scene);
        // 1. Process new elements
        // const groups = new Map();
        const numElements = scene.elements.length;
        const newElements = elements.map((element, index) => {
            // 1.1. Check if this element is part of a group
            // if (elements.length > 1 && !!element.group && !groups.has(element.group)) {
            //     groups.set(element.group, generateRandomId());
            // }
            // 1.2. Return new element data
            return {
                ...element,
                id: generateRandomId(),
                x1: element.x1 + dx,
                x2: element.x2 + dx,
                y1: element.y1 + dy,
                y2: element.y2 + dy,
                selected: true,
                /// group: this.activeGroup || groups.get(element.group) || null,
                [FIELDS.ORDER]: numElements + index,
            };
        });
        // 2. insert new elements
        newElements.forEach(element => scene.elements.push(element));
        // 3. register history change
        sceneActions.addHistory(scene, {
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
    lockElements: (scene, elements) => {
        // 1. Get elements to lock
        const elementsToUpdate = elements.filter(el => !el.locked);
        // 2. Register history change
        sceneActions.addHistory(scene, {
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
    unlockElements: (scene, elements) => {
        // 1. Get elements to unlock
        const elementsToUpdate = elements.filter(el => el.locked);
        // 2. Register history change
        sceneActions.addHistory(scene, {
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
    orderElements: (scene, elements, sign, absolute) => {
        const changedElements = new Set();
        const prevElementsPosition = new Map();
        const nextElementsPosition = new Map();
        const length = scene.elements.length;
        // 1. Save current elements position
        scene.elements.forEach(element => {
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
                    const nextElement = scene.elements[newPosition];
                    // 2.2. Set the new position
                    element[FIELDS.ORDER] = newPosition;
                    nextElement[FIELDS.ORDER] = newPosition - sign;
                    // 2.3. Sort elements by order
                    scene.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                    // 2.4. Set both elements as changed
                    changedElements.add(element.id);
                    changedElements.add(nextElement.id);
                }
            });
        // 3. Fix order in case of moving all elements to front or back
        if (absolute) {
            scene.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
            scene.elements.forEach((element, index) => {
                element[FIELDS.ORDER] = index;
                changedElements.add(element.id);
            });
        }
        // 4. Get new positions
        scene.elements.forEach(element => {
            nextElementsPosition.set(element.id, element[FIELDS.ORDER]);
        });
        // 5. Register history change
        sceneActions.addHistory(scene, {
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
    bringElementsForward: (scene, elements) => {
        return sceneActions.orderElements(scene, elements, +1, false);
    },
    sendElementsBackward: (scene, elements) => {
        return sceneActions.orderElements(scene, elements, -1, false);
    },
    bringElementsToFront: (scene, elements) => {
        return sceneActions.orderElements(scene, elements, +1, true);
    },
    sendElementsToBack: (scene, elements) => {
        return sceneActions.orderElements(scene, elements, -1, true);
    },

    // 
    // Create new elements
    //
    addTextElement(scene, text, tx = null, ty = null) {
        sceneActions.clearSelection(scene);
        const x = tx ?? (scene.state.translateX + scene.width / 2);
        const y = ty ?? (scene.state.translateY + scene.height / 2);
        const element = sceneActions.createElement(scene, ELEMENTS.TEXT);
        const elementConfig = getElementConfig(element);

        // We need to assign initial text values to this element
        Object.assign(element, {
            ...(elementConfig.initialize?.(scene.defaults) || {}),
            text: text,
            selected: true,
            // group: this.activeGroup || null,
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
        sceneActions.addElements(scene, [element]);
        // this.update();
        return Promise.resolve(element);
    },
    addImageElement(scene, image, tx = null, ty = null) {
        sceneActions.clearSelection(scene);
        return loadImage(image).then(img => {
            const x = tx ?? (scene.state.translateX + scene.width / 2);
            const y = ty ?? (scene.state.translateY + scene.height / 2);
            const element = sceneActions.createElement(scene, ELEMENTS.IMAGE);
            const elementConfig = getElementConfig(element);
            Object.assign(element, {
                ...(elementConfig.initialize?.(scene.defaults) || {}),
                assetId: sceneActions.addAsset(scene, image),
                // image: image,
                imageWidth: img.width,
                imageHeight: img.height,
                x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                selected: true,
                // group: this.activeGroup || null,
            });
            sceneActions.addElements(scene, [element]);
            // this.update();
            return element;
        });
    },

    //
    // Selection api
    //
    clearSelection: (scene) => {
        scene.elements.forEach(element => element.selected = false);
    },
    getSelection: (scene) => {
        return scene.elements.filter(element => element.selected);
    },
    setSelection: (scene, selection) => {
        scene.elements.forEach(element => {
            element.selected = false;
            if (!element.locked) {
                if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                    if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                        element.selected = true;
                    }
                }
            }
        });
    },
    removeSelection: (scene) => {
        return sceneActions.removeElements(scene, sceneActions.getSelection(scene));
    },
    snapshotSelection: (scene) => {
        return sceneActions.getSelection(scene).map(el => ({...el}));
    },
    updateSelection: (scene, key, value) => {
        return sceneActions.updateElements(scene, sceneActions.getSelection(scene), [key], [value], false);
    },

    //
    // History API
    //
    // @description Clear history
    clearHistory: (scene) => {
        scene.history = [];
    },
    // @description Adds a new history item
    addHistory: (scene, entry) => {
        // 1. Check the current history index
        let index = scene.history.findIndex(item => item.current);
        if (index > 0) {
            scene.history = scene.history.slice(index);
            index = 0;
        }
        // 2. Check for updating the same elements and the same keys
        if (entry.keys && entry.ids && scene.history.length > 0) {
            const last = scene.history[0];
            if (last.ids === entry.ids && last.keys === entry.keys) {
                const keys = entry.keys.split(",");
                return last.elements.forEach((element, index) => {
                    element.newValues = Object.fromEntries(keys.map(key => {
                        return [key, entry.elements[index].newValues[key]];
                    }));
                });
            }
        }
        // Check to reset current history item
        if (index > -1) {
            scene.history[index].current = false;
        }
        // Register new history entry
        scene.history.unshift({...entry, current: true});
    },
    // Undo last change
    undo(scene) {
        const index = scene.history.findIndex(item => item.current);
        if (index > -1 && index < scene.history.length) {
            const entry = scene.history[index];
            if (entry.type === CHANGES.CREATE) {
                const removeElements = new Set(entry.elements.map(el => el.id));
                scene.elements = scene.elements.filter(el => {
                    return !removeElements.has(el.id);
                });
            } else if (entry.type === CHANGES.REMOVE) {
                // We need to restore elements in the current order
                entry.elements.forEach(el => {
                    scene.elements.splice(el.prevValues[FIELDS.ORDER], 0, {...el.prevValues});
                });
            } else if (entry.type === CHANGES.UPDATE) {
                entry.elements.forEach(item => {
                    // 1. Update element values
                    const element = scene.elements.find(el => el.id === item.id);
                    Object.assign(element, item.prevValues);
                    // 2. Apply element update
                    const changedKeys = new Set(Object.keys(item.prevValues));
                    getElementConfig(element)?.onUpdate?.(element, changedKeys);
                });
            }
            // Sort elements by order
            scene.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
            scene.elements.forEach(el => {
                el.selected = false;
                el.editing = false;
            });
            // Change active history item
            scene.history[index].current = false;
            if (index + 1 < scene.history.length) {
                scene.history[index + 1].current = true;
            }
            // this.activeGroup = null;
            // this.setAction(null);
            // this.update();
        }
    },
    redo(scene) {
        let index = scene.history.findIndex(item => item.current);
        if (index > 0 && scene.history.length > 0) {
            scene.history[index].current = false;
            index = index - 1;
            // this.historyIndex = this.historyIndex - 1;
            const entry = scene.history[index];
            if (entry.type === CHANGES.CREATE) {
                entry.elements.forEach(el => {
                    scene.elements.splice(el.newValues[FIELDS.ORDER], 0, {...el.newValues});
                });
            } else if (entry.type === CHANGES.REMOVE) {
                const removeElements = new Set(entry.elements.map(el => el.id));
                scene.elements = scene.elements.filter(el => !removeElements.has(el.id));
            } else if (entry.type === CHANGES.UPDATE) {
                entry.elements.forEach(item => {
                    // 1. Update element values
                    const element = scene.elements.find(el => el.id === item.id);
                    Object.assign(element, item.newValues);
                    // 2. Apply element update
                    const changedKeys = new Set(Object.keys(item.newValues));
                    getElementConfig(element)?.onUpdate?.(element, changedKeys);
                });
            }
            // sort elements by order
            scene.elements
                .sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER])
                .forEach(element => {
                    element.selected = false;
                    element.editing = false;
                });
            scene.history[index].current = true;
            // this.activeGroup = null;
            // this.setAction(null);
            // this.update();
        }
    },
    isUndoDisabled(scene) {
        // return this.historyIndex >= this.history.length;
        return scene.history.findIndex(item => item.current) === -1;
    },
    isRedoDisabled(scene) {
        // return this.historyIndex === 0 || this.history.length < 1;
        return scene.history.length < 1 || scene.history[0].current;
    },

    //
    // Zoom API
    //
    setZoom(scene, value) {
        const prevZoom = scene.state.zoom;
        const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
        scene.state.translateX = Math.floor(scene.state.translateX + scene.width * (prevZoom - nextZoom) / 2);
        scene.state.translateY = Math.floor(scene.state.translateY + scene.height * (prevZoom - nextZoom) / 2);
        scene.state.zoom = nextZoom;
    },
    zoomIn(scene) {
        return sceneActions.setZoom(scene, scene.state.zoom + ZOOM_STEP);
    },
    zoomOut(scene) {
        return sceneActions.setZoom(scene.state.zoom - ZOOM_STEP);
    },
};
