import {uid} from "uid/secure";
import {
    CHANGES,
    DEFAULTS,
    ELEMENTS,
    FIELDS,
    GRID_SIZE,
    PASTE_OFFSET,
    ZOOM_DEFAULT,
} from "./constants.js";
import {BACKGROUND_COLORS} from "./utils/colors.js";
import {loadImage} from "./utils/image.js";
import {getRectangleBounds} from "./utils/math.js";
import {
    getTextFromClipboard,
    copyTextToClipboard,
    getTextFromClipboardItem,
    getBlobFromClipboardItem,
} from "./utils/clipboard.js";
import {
    getElementConfig,
    createElement,
    measureTextInElement,
} from "./elements.js";
import {
    parseZoomValue,
    getTranslateCoordinatesForNewZoom,
} from "./zoom.js";

// @private clipboard key
const CLIPBOARD_KEY = "folio:::";

// @private generate a random ID
const generateRandomId = () => uid(20);

// @private helper method to change order of provided elements in scene
const setElementsOrderInScene = (scene, elements, sign, absolute) => {
    let allElements = scene.page.elements;
    if (scene.page.activeGroup && elements.every(el => el.group === scene.page.activeGroup)) {
        allElements = scene.page.elements.filter(el => {
            return el.group === scene.page.activeGroup;
        });
    }
    const changedElements = new Set();
    const prevElementsPosition = new Map();
    const nextElementsPosition = new Map();
    const minOrder = Math.min(...allElements.map(el => el[FIELDS.ORDER]));
    const maxOrder = Math.max(...allElements.map(el => el[FIELDS.ORDER]));
    // 1. Save current elements position
    scene.page.elements.forEach(element => {
        prevElementsPosition.set(element.id, element[FIELDS.ORDER]);
    });
    // 2. Fix order position of elements using the sign
    (elements || [])
        .sort((a, b) => sign * (b[FIELDS.ORDER] - a[FIELDS.ORDER]))
        .filter((el, index) => {
            return absolute || (sign > 0 ? el[FIELDS.ORDER] < maxOrder - index : el[FIELDS.ORDER] > index);
        })
        .forEach((element, index) => {
            // move all elements to front or back
            if (absolute) {
                const currentOrder = element[FIELDS.ORDER];
                element[FIELDS.ORDER] = sign > 0 ? maxOrder - index : minOrder + index;
                scene.page.elements.forEach(el => {
                    const condition = sign > 0 ? el[FIELDS.ORDER] >= currentOrder : currentOrder >= el[FIELDS.ORDER];
                    if (el.id !== element.id && condition) {
                        el[FIELDS.ORDER] = el[FIELDS.ORDER] - sign;
                        changedElements.add(el.id);
                    }
                });
                // element[FIELDS.ORDER] = element[FIELDS.ORDER] + 10 * sign * length;
                // changedElements.add(element.id);
            }
            // move only individual elements
            else {
                // 2.1. Get the new position of the element
                let oldPosition = element[FIELDS.ORDER];
                let newPosition = element[FIELDS.ORDER] + sign;
                if (minOrder <= newPosition && newPosition <= maxOrder) {
                    let nextElement = scene.page.elements[newPosition];
                    const nextElementGroup = nextElement[FIELDS.GROUP];
                    if (!scene.page?.activeGroup && nextElementGroup) {
                        while((minOrder <= newPosition + sign) && (newPosition + sign <= maxOrder) && scene.page.elements[newPosition + sign]?.[FIELDS.GROUP] === nextElementGroup) {
                            nextElement[FIELDS.ORDER] = oldPosition;
                            changedElements.add(nextElement.id);
                            oldPosition = oldPosition + sign;
                            newPosition = newPosition + sign;
                            nextElement = scene.page.elements[newPosition];
                        }
                    }
                    // 2.2. Set the new position
                    element[FIELDS.ORDER] = newPosition;
                    nextElement[FIELDS.ORDER] = oldPosition;
                    // 2.3. Sort elements by order
                    scene.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                    // 2.4. Set both elements as changed
                    changedElements.add(element.id);
                    changedElements.add(nextElement.id);
                }
            }
        });
    // 3. Fix order in case of moving all elements to front or back
    scene.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
    scene.page.elements.forEach((element, index) => {
        element[FIELDS.ORDER] = index;
    });
    // 4. Get new positions
    scene.page.elements.forEach(element => {
        nextElementsPosition.set(element.id, element[FIELDS.ORDER]);
        if (element[FIELDS.ORDER] !== prevElementsPosition.get(element.id)) {
            changedElements.add(element.id);
        }
    });
    // 5. Register history change
    scene.addHistory({
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
};

// @private parse text data to scene
const parseTextDataToScene = (scene, content = "", x = null, y = null) => {
    if (typeof content === "string") {
        if (content?.startsWith(CLIPBOARD_KEY)) {
            const data = JSON.parse(content.split(CLIPBOARD_KEY)[1].trim());
            // We need to register the provided assets in the new assets object
            // To prevent different assets ids, we will use a map to convert provided
            // assets Ids to new assets ids
            const assetMap = {};
            Object.values(data?.assets || {}).forEach(asset => {
                if (asset && asset.id && asset.dataUrl) {
                    assetMap[asset.id] = scene.addAsset(asset.dataUrl, asset.type);
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
            const dx = x ? x - bounds.x1 : 0;
            const dy = y ? y - bounds.y1 : 0;
            scene.importElements(elements, dx, dy);
            return Promise.resolve(true);
        }
        // Create a new text element
        return scene.addTextElement(content, x, y);
    }
    // No valid text, reject promise
    return Promise.reject(null);
};

// @private parse initial pages array
const parseInitialPages = initialPages => {
    if (initialPages && Array.isArray(initialPages) && initialPages?.length > 0) {
        return initialPages;
    }
    // Make sure we have a new page
    return [{}];
};

// @private fix pages index
const fixPagesIndex = pages => {
    // Sort pages by the current index
    // and then assign the new correct index by its position on the list
    return [...pages]
        .sort((a, b) => a.index - b.index)
        .forEach((page, index) => {
            page.index = index;
            // return Object.assign(page, {index: index});
        });
};

// @private create a new page
const createPage = (page, index = 0) => ({
    id: page?.id || generateRandomId(),
    title: page?.title || `Page ${index + 1}`,
    elements: (page?.elements || []).map(element => ({
        ...element,
        [FIELDS.SELECTED]: false,
        [FIELDS.EDITING]: false,
        [FIELDS.CREATING]: false,
    })),
    history: page?.history || [],
    historyIndex: page?.historyIndex ?? 0,
    translateX: page?.translateX ?? 0,
    translateY: page?.translateY ?? 0,
    zoom: page?.zoom ?? ZOOM_DEFAULT,
    activeGroup: null,
});

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

// @description Generate a scene state from initial data object
export const getSceneStateFromInitialData = initialData => {
    // Parse pages list from initialData object
    // If no pages are available, a new empty page will be automatically created
    const pages = parseInitialPages(initialData?.pages)
        .map((page, index) => createPage(page, index));
    return {
        id: initialData?.id || generateRandomId(),
        title: initialData?.title || "Untitled",
        pages: pages,
        page: pages.find(page => page.index === 0) || pages[0],
        assets: initialData?.assets || {},
        appState: {
            grid: !!initialData?.appState?.grid,
            snapToElements: !!initialData?.appState?.snapToElements,
        },
        background: initialData?.background || BACKGROUND_COLORS.gray,
        metadata: initialData?.metadata || {},
    };
};

// @description Create a new scene
export const createScene = initialData => {
    const scene = {
        ...getSceneStateFromInitialData(initialData || {}),
        defaults: {...defaults},
        width: 0,
        height: 0,

        // @description load scene from JSON
        fromJSON: data => {
            Object.assign(scene, getSceneStateFromInitialData(data));
        },

        // @description export scene to JSON
        toJSON: () => {
            return {
                title: scene.title,
                pages: scene.pages.map(page => ({
                    id: page.id,
                    title: page.title,
                    elements: page.elements,
                })),
                assets: scene.assets,
                background: scene.background,
                appState: scene.appState,
                metadata: scene.metadata,
            };
        },

        // @description reset scene
        reset: () => {
            scene.fromJSON({});
        },

        //
        // Pages API
        //

        // @description Get the list of available pages
        getPages: () => scene.pages,

        // @description Get a page by id
        getPage: id => {
            return scene.pages.find(page => page.id === id);
        },

        // @description add a new page
        addPage: (setNewPageAsActive = true) => {
            scene.pages.push(createPage({}, scene.pages.length));
            if (setNewPageAsActive) {
                scene.setActivePage(scene.pages[scene.pages.length - 1].id);
            }
        },

        // @description remove the provided page
        removePage: id => {
            // Removing pages is only supported if we have more than one page
            if (scene.pages.length > 1) {
                scene.pages = scene.pages.filter(page => {
                    return page.id !== id && page !== id;
                });
                // Check if the removed page is the current active page
                if (scene.page === id || scene.page.id === id) {
                    scene.page = scene.pages[0];
                }
            }
        },

        // @description move page to the specified index
        movePage: (id, nextIndex) => {
            const prevIndex = scene.pages.findIndex(p => p.id === id || p === id);
            if (prevIndex !== nextIndex) {
                const page = scene.pages[prevIndex];
                scene.pages.splice(prevIndex, 1);
                scene.pages.splice(nextIndex, 0, page);
            }
        },

        // @description get active page
        getActivePage: () => scene.page,

        // @description set active page
        setActivePage: id => {
            // 1. Reset state in all active pages
            scene.page.elements.forEach(element => {
                element[FIELDS.SELECTED] = false;
                element[FIELDS.EDITING] = false;
            });
            // 2. Find and set active page
            // Note: we support both providing the ID or the full page object
            scene.page = scene.pages.find(page => page.id === id || page === id);
        },

        // 
        // Assets api
        //

        // @description Get an asset by ID
        getAsset: id => {
            return scene.assets[id] || null;
        },

        // @description add a new asset
        addAsset: data => {
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

        // @description Get an element by ID
        getElement: id => {
            return scene.page.elements.find(el => el.id === id);
        },

        // @description Get all elements in scene
        getElements: () => {
            return scene.page.elements;
        },

        // @description Get only erased elements
        getErasedElements: () => {
            return scene.page.elements.filter(element => element.erased);
        },

        // @description Create a new element
        // @deprecated: use createNewElement instead
        createElement: type => {
            console.warn(`scene.createElement is deprecated. Please use createElement from 'elements.js' instead`);
            return {
                ...createElement(type),
                [FIELDS.ORDER]: scene.page.elements.length,
            };
        },

        // @description clear elements in scene
        clearElements: () => {
            scene.page.elements = [];
        },

        // @description Add new elements into scene
        addElements: elements => {
            if (elements && elements.length > 0) {
                const numElements = scene.page.elements.length;
                // 1. Fix elements positions
                elements.forEach((element, index) => {
                    element[FIELDS.ORDER] = numElements + index;
                });
                // 2. Register element create in the history
                scene.addHistory({
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
                // 3. Add new elements
                elements.forEach(element => {
                    return scene.page.elements.push(element);
                });
            }
        },

        // @description remove provided elements from scene
        removeElements: elements => {
            if (elements && elements.length > 0) {
                // 1. Register element remove in the history
                scene.addHistory({
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
                scene.page.elements = scene.page.elements.filter(element => {
                    return !elementsToRemove.has(element.id);
                });
                // 3. Reset elements order
                scene.page.elements.forEach((element, index) => {
                    element[FIELDS.ORDER] = index;
                });
            }
        },

        // @description update specified attributes from provided elements
        updateElements: (elements, keys, values, groupChanges = true) => {
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
                scene.addHistory({
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

        // @description import elements into scene
        importElements: (elements, dx = 0, dy = 0) => {
            scene.clearSelection();
            // 1. Process new elements
            // const groups = new Map();
            const numElements = scene.page.elements.length;
            const newElements = elements.map((element, index) => {
                // 1.1. Check if this element is part of a group
                // if (elements.length > 1 && !!element.group && !groups.has(element.group)) {
                //     groups.set(element.group, generateRandomId());
                // }
                // 1.2 Prepare new element configuration
                const newElement = {
                    ...element,
                    id: generateRandomId(),
                    x1: element.x1 + dx,
                    x2: element.x2 + dx,
                    y1: element.y1 + dy,
                    y2: element.y2 + dy,
                    selected: true,
                    [FIELDS.GROUP]: scene.page?.activeGroup || null,
                    [FIELDS.ORDER]: numElements + index,
                };
                // 1.3 Check if this element has an onDuplicate listener defined
                const elementConfig = getElementConfig(element);
                if (elementConfig?.onDuplicate) {
                    elementConfig.onDuplicate(newElement, dx, dy);
                }
                // 1.4 Return the new element data
                return newElement;
            });
            // 2. insert new elements
            newElements.forEach(element => scene.page.elements.push(element));
            // 3. register history change
            scene.addHistory({
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

        // @description export elements as JSON
        exportElements: (elementsToExport = null) => {
            const elements = elementsToExport || scene.getElements();
            return {
                elements: elements,
                assets: elements.reduce((assets, element) => {
                    // Copy only assets in the current selection
                    if (element.assetId && scene.assets[element.assetId]) {
                        assets[element.assetId] = scene.assets[element.assetId];
                    }
                    return assets;
                }, {}),
                // background: scene.background,
            };
        },

        // @description duplicate provided elements
        duplicateElements: elements => {
            const bounds = getRectangleBounds(elements);
            return scene.importElements(elements, (bounds.x2 + PASTE_OFFSET) - bounds.x1, 0);
        },

        // @description lock elements
        lockElements: elements => {
            // 1. Get elements to lock
            const elementsToUpdate = elements.filter(el => !el.locked);
            // 2. Register history change
            scene.addHistory({
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

        // @description unlock provided elements
        unlockElements: elements => {
            // 1. Get elements to unlock
            const elementsToUpdate = elements.filter(el => el.locked);
            // 2. Register history change
            scene.addHistory({
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

        // @description bring provided elements forward
        bringElementsForward: elements => {
            return setElementsOrderInScene(scene, elements, +1, false);
        },

        // @description send provided elements backward
        sendElementsBackward: elements => {
            return setElementsOrderInScene(scene, elements, -1, false);
        },

        // @description bring provided elements to front
        bringElementsToFront: elements => {
            return setElementsOrderInScene(scene, elements, +1, true);
        },

        // @description send provided elements to back
        sendElementsToBack: elements => {
            return setElementsOrderInScene(scene, elements, -1, true);
        },

        // @description group elements in the current selection
        groupElements: elements => {
            const groupId = generateRandomId();
            const selectedElements = new Set(elements.map(element => element.id));
            const updatedElements = [...elements];
            const prevElementsOrder = new Map(scene.page.elements.map(element => {
                return [element.id, element[FIELDS.ORDER]];
            }));
            const prevElementsGroup = new Map(scene.page.elements.map(element => {
                return [element.id, element[FIELDS.GROUP] || null];
            }));
            const minOrder = Math.min(...elements.map(element => element[FIELDS.ORDER]));
            const maxOrder = Math.max(...elements.map(element => element[FIELDS.ORDER]));
            // TODO: we should check if there is an element that belongs to a non selected group?
            // 1. Find the elements index with the minimum and maximum order
            const maxOrderIndex = scene.page.elements.findIndex(element => element[FIELDS.ORDER] === maxOrder);
            const minOrderIndex = scene.page.elements.findIndex(element => element[FIELDS.ORDER] === minOrder);
            // 2. Fix the order of all elements between [minOrderIndex, maxOrderIndex] that are not selected
            let index = 0;
            for (let i = minOrderIndex + 1; i < maxOrderIndex; i++) {
                const element = scene.page.elements[i];
                if (!selectedElements.has(element.id)) {
                    element[FIELDS.ORDER] = minOrder + index;
                    index = index + 1;
                    updatedElements.push(element);
                }
            }
            // 3. Fix the order of the new elements and assign the new group
            for (let i = 0; i < elements.length; i++) {
                elements[elements.length - i - 1][FIELDS.ORDER] = maxOrder - i;
                elements[elements.length - i - 1][FIELDS.GROUP] = groupId;
            }
            // 4. Add new history change
            scene.addHistory({
                type: CHANGES.UPDATE,
                elements: updatedElements.map(element => {
                    const entry = {
                        id: element.id,
                        prevValues: {
                            [FIELDS.ORDER]: prevElementsOrder.get(element.id),
                        },
                        newValues: {
                            [FIELDS.ORDER]: element[FIELDS.ORDER],
                        },
                    };
                    // Check if this element is inside the new group
                    if (selectedElements.has(element.id)) {
                        entry.prevValues[FIELDS.GROUP] = prevElementsGroup.get(element.id);
                        entry.newValues[FIELDS.GROUP] = element[FIELDS.GROUP];
                    }
                    return entry;
                }),
            });
            // Sort elements
            scene.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
        },

        // @description ungroup elements
        ungroupElements: elements => {
            scene.updateElements(elements, [FIELDS.GROUP], [null], false);
        },

        // 
        // Create new elements
        //

        // @description add a new text element into scene
        addTextElement: (text, tx = null, ty = null) => {
            scene.clearSelection();
            const x = tx ?? (scene.page.translateX + scene.width / 2);
            const y = ty ?? (scene.page.translateY + scene.height / 2);
            const element = createElement(ELEMENTS.TEXT);
            const elementConfig = getElementConfig(element);

            // We need to assign initial text values to this element
            Object.assign(element, {
                ...(elementConfig.initialize?.(scene.defaults) || {}),
                text: text,
                selected: true,
                [FIELDS.GROUP]: null,
            });
            const [textWidth, textHeight] = measureTextInElement(element, text || " ");
            // Override element position
            Object.assign(element, {
                x1: Math.floor((x - textWidth / 2) / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - textHeight / 2) / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + textWidth / 2) / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + textHeight / 2) / GRID_SIZE) * GRID_SIZE,
                textWidth: textWidth,
                textHeight: textHeight,
            });
            scene.addElements([element]);
            // this.update();
            return Promise.resolve(element);
        },

        // @description adds a new image into the scene as an element
        addImageElement: (image, tx = null, ty = null) => {
            scene.clearSelection();
            return loadImage(image).then(img => {
                const x = tx ?? (scene.page.translateX + scene.width / 2);
                const y = ty ?? (scene.page.translateY + scene.height / 2);
                const element = createElement(ELEMENTS.IMAGE);
                const elementConfig = getElementConfig(element);
                Object.assign(element, {
                    ...(elementConfig.initialize?.(scene.defaults) || {}),
                    assetId: scene.addAsset(image),
                    // image: image,
                    imageWidth: img.width,
                    imageHeight: img.height,
                    x1: Math.floor((x - img.width / 2) / GRID_SIZE) * GRID_SIZE,
                    y1: Math.floor((y - img.height / 2) / GRID_SIZE) * GRID_SIZE,
                    x2: Math.ceil((x + img.width / 2) / GRID_SIZE) * GRID_SIZE,
                    y2: Math.ceil((y + img.height / 2) / GRID_SIZE) * GRID_SIZE,
                    selected: true,
                    [FIELDS.GROUP]: null,
                });
                scene.addElements([element]);
                // this.update();
                return element;
            });
        },

        //
        // Selection api
        //

        // @description clear current selection
        clearSelection: () => {
            scene.page.elements.forEach(element => element.selected = false);
        },

        // @description get selected elements
        getSelection: () => {
            return scene.page.elements.filter(element => element.selected);
        },

        // @description set selected elements
        setSelection: selection => {
            const groups = new Set();
            // 1. select the elements using the selection area
            scene.page.elements.forEach(element => {
                element.selected = false;
                if (!element.locked) {
                    if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                        if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                            element.selected = true;
                            if (element.group && !scene.page.activeGroup) {
                                groups.add(element.group);
                            }
                        }
                    }
                }
            });
            // 2. Select the elements based on the groups set
            if (!scene.page.activeGroup && groups.size > 0) {
                scene.page.elements.forEach(element => {
                    if (element.group && groups.has(element.group)) {
                        element.selected = true;
                    }
                });
            }
        },

        // @description remove selected elements
        // @deprecated use scene.removeElements() instead
        removeSelection: () => {
            return scene.removeElements(scene.getSelection());
        },

        // @description get an snapshot from the current selection
        // @deprecated use map instead
        snapshotSelection: () => {
            return scene.getSelection().map(el => ({...el}));
        },

        // @description update a key and a value in the current selection
        // @deprecated use scene.updateElements instead
        updateSelection: (key, value) => {
            return scene.updateElements(scene.getSelection(), [key], [value], false);
        },

        //
        // History API
        //

        // @description Get current history
        getHistory: () => {
            return scene.page.history;
        },

        // @description Clear history
        clearHistory: () => {
            scene.page.history = [];
            scene.page.historyIndex = 0;
        },

        // @description Adds a new history item
        addHistory: entry => {
            // 1. Check the current history index
            if (scene.page.historyIndex > 0) {
                scene.page.history = scene.page.history.slice(scene.page.historyIndex);
                scene.page.historyIndex = 0;
            }
            // 2. Check for updating the same elements and the same keys
            if (entry.ids && scene.page.history.length > 0) {
                const last = scene.page.history[0];
                if (last.ids === entry.ids && last.keys === entry.keys) {
                    return last.elements.forEach((element, index) => {
                        // Note: we are using the keys defined in the newValues object instead of using
                        // the keys defined in entry.keys
                        Object.keys(entry.elements[index].newValues).forEach(key => {
                            element.newValues[key] = entry.elements[index].newValues[key];
                        });
                    });
                }
            }
            // Register new history entry
            scene.page.history.unshift(entry);
        },

        // @description Perform an undo change to the scene
        undo: () => {
            if (scene.page.historyIndex < scene.page.history.length) {
                const entry = scene.page.history[scene.page.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    scene.page.elements = scene.page.elements.filter(el => {
                        return !removeElements.has(el.id);
                    });
                } else if (entry.type === CHANGES.REMOVE) {
                    // We need to restore elements in the current order
                    entry.elements.forEach(el => {
                        scene.page.elements.splice(el.prevValues[FIELDS.ORDER], 0, {...el.prevValues});
                    });
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(item => {
                        // 1. Update element values
                        const element = scene.page.elements.find(el => el.id === item.id);
                        Object.assign(element, item.prevValues);
                        // 2. Apply element update
                        const changedKeys = new Set(Object.keys(item.prevValues));
                        getElementConfig(element)?.onUpdate?.(element, changedKeys);
                    });
                }
                // Sort elements by order
                scene.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                scene.page.elements.forEach(el => {
                    el.selected = false;
                    el.editing = false;
                });
                scene.page.historyIndex = scene.page.historyIndex + 1;
            }
        },

        // @description Perform a redo action to the scene
        redo: () => {
            if (scene.page.historyIndex > 0 && scene.page.history.length > 0) {
                scene.page.historyIndex = scene.page.historyIndex - 1;
                const entry = scene.page.history[scene.page.historyIndex];
                if (entry.type === CHANGES.CREATE) {
                    entry.elements.forEach(el => {
                        scene.page.elements.splice(el.newValues[FIELDS.ORDER], 0, {...el.newValues});
                    });
                } else if (entry.type === CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    scene.page.elements = scene.page.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === CHANGES.UPDATE) {
                    entry.elements.forEach(item => {
                        // 1. Update element values
                        const element = scene.page.elements.find(el => el.id === item.id);
                        Object.assign(element, item.newValues);
                        // 2. Apply element update
                        const changedKeys = new Set(Object.keys(item.newValues));
                        getElementConfig(element)?.onUpdate?.(element, changedKeys);
                    });
                }
                // sort elements by order
                scene.page.elements
                    .sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER])
                    .forEach(element => {
                        element.selected = false;
                        element.editing = false;
                    });
                // this.activeGroup = null;
                // this.setAction(null);
                // this.update();
            }
        },

        // @description check if undo action is enabled
        canUndo: () => {
            return !(scene.page.historyIndex >= scene.page.history.length);
        },

        // @description Check if redo action is enabled
        canRedo: () => {
            return !(scene.page.historyIndex === 0 || scene.page.history.length < 1);
        },

        //
        // Zoom API
        //

        // @description get current zoom
        getZoom: () => scene.page.zoom,

        // @description set current zoom
        setZoom: (value = ZOOM_DEFAULT) => {
            const newZoom = parseZoomValue(value);
            const {translateX, translateY} = getTranslateCoordinatesForNewZoom(newZoom, {
                width: scene.width,
                height: scene.height,
                translateX: scene.page.translateX,
                translateY: scene.page.translateY,
                zoom: scene.page.zoom,
            });
            // Update scene values
            scene.page.zoom = newZoom;
            scene.page.translateX = translateX;
            scene.page.translateY = translateY;
        },

        // @description reset zoom to the default value
        resetZoom: () => scene.setZoom(ZOOM_DEFAULT),

        //
        // Scene size api
        // 

        // @description set scene size
        setSize: (newWidth = 0, newHeight = 0) => {
            scene.width = +newWidth;
            scene.height = +newHeight;
        },

        //
        // Clipboard api
        //

        // @description Copy current selection to clipboard
        copyElementsToClipboard: elements => {
            const data = scene.exportElements(elements);  
            return copyTextToClipboard(`${CLIPBOARD_KEY}${JSON.stringify(data)}`);
        },

        // @description Copy current selection to clipboard and remove selection
        cutElementsToClipboard: elements => {
            return scene.copyElementsToClipboard(elements).then(() => {
                return scene.removeElements(elements);
            });
        },

        // @description Get data from clipboard and add it to the scene
        pasteElementsFromClipboard: (event, point) => {
            const x = point ? (point.x - scene.page.translateX) / scene.page.zoom : null;
            const y = point ? (point.y - scene.page.translateY) / scene.page.zoom : null;

            // Check for paste event
            if (event?.clipboardData) {
                const clipboardItems = event.clipboardData?.items || [];
                for (let i = 0; i < clipboardItems.length; i++) {
                    const item = clipboardItems[i];
                    // Check for image data (image/png, image/jpg)
                    if (item.type.startsWith("image/")) {
                        return getBlobFromClipboardItem(item)
                            .then(content => scene.addImageElement(content, x, y));
                    }
                    // Check for text data
                    else if (item.type === "text/plain") {
                        return getTextFromClipboardItem(item)
                            .then(content => parseTextDataToScene(scene, content, x, y));
                    }
                }
            }
            // If not, check clipboard
            return getTextFromClipboard()
                .then(content => parseTextDataToScene(scene, content, x, y));
        },
    };

    return scene;
};
