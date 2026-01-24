import {uid} from "uid/secure";
import {
    CHANGES,
    DEFAULTS,
    ELEMENTS,
    FIELDS,
    PASTE_OFFSET,
    ZOOM_DEFAULT,
    ASSETS,
    VERSION,
    TOOLS,
} from "../constants.js";
import {BACKGROUND_COLORS} from "../utils/colors.js";
import {blobToDataUrl} from "../utils/blob.js";
import {loadImage} from "../utils/image.js";
import {isLink, getLinkMetadata} from "../utils/link.js";
import {
    copyTextToClipboard,
    getClipboardContents,
} from "../utils/clipboard.js";
import {
    getElementConfig,
    createElement,
    measureTextInElement,
    getElementDisplayName,
    getElementsBoundingRectangle,
} from "./elements.js";
import {
    parseZoomValue,
    getTranslateCoordinatesForNewZoom,
    getZoomToFitElements,
} from "./zoom.js";
// import {
//     getLibraryStateFromInitialData,
//     createLibraryComponent,
// } from "./library.ts";

// @private clipboard key
const CLIPBOARD_KEY = "folio:::";

// @private generate a random ID
const generateRandomId = () => uid(20);

// @private helper method to change order of provided elements in editor
const setElementsOrderInEditor = (editor, elements, sign, absolute) => {
    let allElements = editor.page.elements;
    if (editor.page.activeGroup && elements.every(el => el.group === editor.page.activeGroup)) {
        allElements = editor.page.elements.filter(el => {
            return el.group === editor.page.activeGroup;
        });
    }
    const changedElements = new Set();
    const prevElementsPosition = new Map();
    const nextElementsPosition = new Map();
    const minOrder = Math.min(...allElements.map(el => el[FIELDS.ORDER]));
    const maxOrder = Math.max(...allElements.map(el => el[FIELDS.ORDER]));
    // 1. Save current elements position
    editor.page.elements.forEach(element => {
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
                editor.page.elements.forEach(el => {
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
                    let nextElement = editor.page.elements[newPosition];
                    const nextElementGroup = nextElement[FIELDS.GROUP];
                    if (!editor.page?.activeGroup && nextElementGroup) {
                        while((minOrder <= newPosition + sign) && (newPosition + sign <= maxOrder) && editor.page.elements[newPosition + sign]?.[FIELDS.GROUP] === nextElementGroup) {
                            nextElement[FIELDS.ORDER] = oldPosition;
                            changedElements.add(nextElement.id);
                            oldPosition = oldPosition + sign;
                            newPosition = newPosition + sign;
                            nextElement = editor.page.elements[newPosition];
                        }
                    }
                    // 2.2. Set the new position
                    element[FIELDS.ORDER] = newPosition;
                    nextElement[FIELDS.ORDER] = oldPosition;
                    // 2.3. Sort elements by order
                    editor.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                    // 2.4. Set both elements as changed
                    changedElements.add(element.id);
                    changedElements.add(nextElement.id);
                }
            }
        });
    // 3. Fix order in case of moving all elements to front or back
    editor.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
    editor.page.elements.forEach((element, index) => {
        element[FIELDS.ORDER] = index;
    });
    // 4. Get new positions
    editor.page.elements.forEach(element => {
        nextElementsPosition.set(element.id, element[FIELDS.ORDER]);
        if (element[FIELDS.ORDER] !== prevElementsPosition.get(element.id)) {
            changedElements.add(element.id);
        }
    });
    // 5. Register history change
    editor.addHistory({
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

// @private parse text data to editor
const parseTextDataToEditor = (editor, content = "", x = null, y = null) => {
    if (typeof content === "string") {
        if (content?.startsWith(CLIPBOARD_KEY)) {
            const data = JSON.parse(content.split(CLIPBOARD_KEY)[1].trim());
            // We need to register the provided assets in the new assets object
            // To prevent different assets ids, we will use a map to convert provided
            // assets Ids to new assets ids
            const assetMap = {};
            Object.values(data?.assets || {}).forEach(asset => {
                if (asset && asset.id && asset.dataUrl) {
                    assetMap[asset.id] = editor.addAsset(asset.dataUrl, asset.type);
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
            const bounds = getElementsBoundingRectangle(data?.elements || []);
            const dx = x ? x - bounds[0][0] : 0;
            const dy = y ? y - bounds[0][1] : 0;
            editor.importElements(elements, dx, dy);
            return Promise.resolve(true);
        }
        // Check for text containing a link
        else if (isLink(content.trim())) {
            return editor.addBookmarkElement(content.trim(), x, y);
        }
        // Create a new text element
        return editor.addTextElement(content, x, y);
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
const createPage = (page, index = 0) => {
    return {
        id: page?.id || generateRandomId(),
        title: page?.title || `Page ${index + 1}`,
        description: page?.description || "",
        elements: (page?.elements || []).map(element => ({
            ...element,
            [FIELDS.SELECTED]: false,
            [FIELDS.EDITING]: false,
            [FIELDS.CREATING]: false,
            [FIELDS.VERSION]: element[FIELDS.VERSION] ?? 0,
            [FIELDS.NAME]: element[FIELDS.NAME] || getElementDisplayName(element),
        })),
        history: page?.history || [],
        historyIndex: page?.historyIndex ?? 0,
        translateX: page?.translateX ?? 0,
        translateY: page?.translateY ?? 0,
        zoom: page?.zoom ?? ZOOM_DEFAULT,
        activeGroup: null,
        readonly: !!page?.readonly,
    };
};

// @description generate default values for new elements
export const getDefaults = () => {
    return {
        fillColor: DEFAULTS.FILL_COLOR,
        fillStyle: DEFAULTS.FILL_STYLE,
        strokeWidth: DEFAULTS.STROKE_WIDTH,
        strokeColor: DEFAULTS.STROKE_COLOR,
        strokeStyle: DEFAULTS.STROKE_STYLE,
        textColor: DEFAULTS.TEXT_COLOR,
        textFont: DEFAULTS.TEXT_FONT,
        textSize: DEFAULTS.TEXT_SIZE,
        textAlign: DEFAULTS.TEXT_ALIGN,
        [FIELDS.TEXT_VERTICAL_ALIGN]: DEFAULTS.TEXT_VERTICAL_ALIGN,
        shape: DEFAULTS.SHAPE,
        [FIELDS.ARROW_SHAPE]: DEFAULTS.ARROW_SHAPE,
        startArrowhead: DEFAULTS.ARROWHEAD_START,
        endArrowhead: DEFAULTS.ARROWHEAD_END,
        opacity: DEFAULTS.OPACITY,
        [FIELDS.NOTE_COLOR]: DEFAULTS.NOTE_COLOR,
        [FIELDS.STICKER]: DEFAULTS.STICKER,
    };
};

// @description Generate a editor state from initial data object
export const getEditorStateFromInitialData = initialData => {
    // Parse pages list from initialData object
    // If no pages are available, a new empty page will be automatically created
    const pages = parseInitialPages(initialData?.pages).map((page, index) => {
        return createPage(page, index);
    });
    return {
        id: initialData?.id || generateRandomId(),
        version: initialData?.version || VERSION,
        title: initialData?.title || "Untitled",
        pages: pages,
        page: pages.find(page => page.index === 0) || pages[0],
        assets: initialData?.assets || {},
        appState: {
            grid: !!initialData?.appState?.grid,
            snapToElements: !!initialData?.appState?.snapToElements,
            objectDimensions: !!initialData?.appState?.objectDimensions,
        },
        background: initialData?.background || BACKGROUND_COLORS.gray,
        metadata: initialData?.metadata || {},
    };
};

// @description Create a new editor
export const createEditor = (options = {}) => {
    const editor = {
        ...getEditorStateFromInitialData(options?.data || {}),
        defaults: getDefaults(),
        updatedAt: Date.now(),

        // @description library state
        // @param {object} library.items list of items in the library
        // library: getLibraryStateFromInitialData(options?.library || {}),

        // @description internal editor state
        state: {
            tool: TOOLS.SELECT,
            toolLocked: false,
            selection: null,
            snapEdges: null,
        },

        // @description editor size
        width: 0,
        height: 0,

        // @description load editor from JSON
        fromJSON: data => {
            Object.assign(editor, getEditorStateFromInitialData(data));
        },

        // @description export editor to JSON
        toJSON: () => {
            return {
                version: editor.version || VERSION,
                title: editor.title,
                pages: editor.pages.map(page => ({
                    id: page.id,
                    title: page.title,
                    description: page.description || "",
                    elements: page.elements,
                    readonly: !!page.readonly,
                })),
                assets: editor.assets,
                background: editor.background,
                appState: editor.appState,
                metadata: editor.metadata,
            };
        },

        // @description reset editor
        reset: () => {
            editor.fromJSON({});
        },

        //
        // Pages API
        //

        // @description Get the list of available pages
        getPages: () => editor.pages,

        // @description Get a page by id
        getPage: id => {
            return editor.pages.find(page => page.id === id || page === id);
        },

        // @description add a new page
        addPage: (data = {}, index = null, setNewPageAsActive = true) => {
            const newPage = createPage(data, editor.pages.length);
            // 1. Insert the page in the specified index (if provided)
            if (index !== null && index >= 0 && index < editor.pages.length) {
                editor.pages.splice(index, 0, newPage);
            }
            else {
                editor.pages.push(newPage);
            }
            // 2. check if we need to set the new page as active
            if (setNewPageAsActive) {
                editor.setActivePage(newPage.id);
            }
        },

        // @description remove the provided page
        removePage: id => {
            // Removing pages is only supported if we have more than one page
            if (editor.pages.length > 1) {
                editor.pages = editor.pages.filter(page => {
                    return page.id !== id && page !== id;
                });
                // Check if the removed page is the current active page
                if (editor.page === id || editor.page.id === id) {
                    editor.page = editor.pages[0];
                }
            }
        },

        // @description move page to the specified index
        movePage: (id, nextIndex) => {
            const prevIndex = editor.pages.findIndex(p => p.id === id || p === id);
            if (prevIndex !== nextIndex) {
                const page = editor.pages[prevIndex];
                editor.pages.splice(prevIndex, 1);
                editor.pages.splice(nextIndex, 0, page);
            }
        },

        // @description duplicate the provided page
        duplicatePage: (id, index = null, setAsActive = true) => {
            const page = editor.getPage(id);
            const newPageData = {
                title: "Copy of " + (page?.title || "-"),
                elements: page?.elements || [],
            };
            editor.addPage(newPageData, index, setAsActive);
        },

        // @description clear the content of the provided page
        clearPage: id => {
            Object.assign(editor.getPage(id), {
                elements: [],
                history: [], // remove all history
                historyIndex: 0,
                activeGroup: null,
            });
        },

        // @description get active page
        getActivePage: () => editor.page,

        // @description set active page
        setActivePage: id => {
            // 1. Reset state in all active pages
            editor.page.elements.forEach(element => {
                element[FIELDS.SELECTED] = false;
                element[FIELDS.EDITING] = false;
            });
            // 2. Find and set active page
            // Note: we support both providing the ID or the full page object
            editor.page = editor.pages.find(page => page.id === id || page === id);
        },

        // 
        // Assets api
        //

        // @description Get an asset by ID
        getAsset: id => {
            return editor.assets[id] || null;
        },

        // @description add a new asset
        addAsset: (type, data = {}) => {
            // First we need to check if this asset is already registered
            let assetId = Object.keys(editor.assets)
                .find(id => {
                    return editor.assets[id].type === type && editor.assets[id].data?.src === data?.src;
                });
            if (!assetId) {
                // Register this asset using a new identifier
                assetId = generateRandomId();
                editor.assets[assetId] = {
                    type: type || ASSETS.IMAGE,
                    data: data,
                };
            }
            return assetId;
        },

        //
        // Elements API
        // 

        // @description Get an element by ID
        getElement: id => {
            return editor.page.elements.find(el => el.id === id);
        },

        // @description Get all elements in editor
        getElements: () => {
            return editor.page.elements;
        },

        // @description Get only erased elements
        getErasedElements: () => {
            return editor.page.elements.filter(element => element.erased);
        },

        // @description Create a new element
        // @deprecated: use createNewElement instead
        createElement: type => {
            console.warn(`editor.createElement is deprecated. Please use createElement from 'elements.js' instead`);
            return {
                ...createElement(type),
                [FIELDS.ORDER]: editor.page.elements.length,
            };
        },

        // @description clear elements in editor
        clearElements: () => {
            editor.page.elements = [];
        },

        // @description Add new elements into editor
        addElements: elements => {
            if (elements && elements.length > 0) {
                const numElements = editor.page.elements.length;
                // 1. Fix elements values
                elements.forEach((element, index) => {
                    element[FIELDS.NAME] = element[FIELDS.NAME] || getElementDisplayName(element);
                    element[FIELDS.ORDER] = numElements + index;
                });
                // 2. Register element create in the history
                editor.addHistory({
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
                    return editor.page.elements.push(element);
                });
            }
        },

        // @description select provided elements
        selectElements: elements => {
            const groups = new Set(elements.map(el => el.group).filter(Boolean));
            const selectedElements = new Set(elements.map(el => el.id));
            const hasElementsWithoutGroup = elements.some(el => !el.group);
            // 1. select the elements using the selection area
            editor.page.elements.forEach(element => {
                element.selected = selectedElements.has(element.id);
            });
            // 2. Select the elements based on the groups set
            if (groups.size > 0 || hasElementsWithoutGroup) {
                // Check if we are selecting elements in the active group
                if (editor.page.activeGroup && groups.size === 1 && groups.has(editor.page.activeGroup)) {
                    // Nothing to do 
                }
                // Other case, reset active group and select elements in all groups
                else {
                    editor.page.activeGroup = null;
                    if (groups.size > 0) {
                        editor.page.elements.forEach(element => {
                            if (element.group && groups.has(element.group)) {
                                element.selected = true;
                            }
                        });
                    }
                }
            }
        },

        // @description remove provided elements from editor
        removeElements: elements => {
            if (elements && elements.length > 0) {
                const changes = [];
                // 1. Register element remove in the history
                changes.push({
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
                editor.page.elements = editor.page.elements.filter(element => {
                    return !elementsToRemove.has(element.id);
                });
                // 3. Check if we have removed elements from any group and we have groups with only one element
                const removedGroups = new Set(elements.filter(el => !!el.group).map(el => el.group));
                if (removedGroups.size > 0) {
                    Array.from(removedGroups).forEach(group => {
                        // 3.1. Get the elements that are still on this group
                        const elementsInGroup = editor.page.elements.filter(el => el.group === group);
                        if (elementsInGroup.length === 1) {
                            // 3.2.1. Register an update change
                            changes.push({
                                type: CHANGES.UPDATE,
                                elements: elementsInGroup.map(element => ({
                                    id: element.id,
                                    prevValues: {
                                        [FIELDS.GROUP]: group,
                                    },
                                    newValues: {
                                        [FIELDS.GROUP]: null,
                                    },
                                })),
                            });
                            // 3.2.2. Remove group attribute
                            elementsInGroup[0][FIELDS.GROUP] = null;
                            // 3.2.3. Reset active group
                            if (editor.page.activeGroup === group) {
                                editor.page.activeGroup = null;
                            }
                        }
                    });
                }
                // 4. Reset elements order
                editor.page.elements.forEach((element, index) => {
                    element[FIELDS.ORDER] = index;
                });
                // 5. Register history changes
                editor.addHistory(changes);
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
                editor.addHistory({
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
                editor.defaults[key] = values[index];
            });
        },

        // @description import elements into editor
        importElements: (elements, dx = null, dy = null, group = null) => {
            editor.clearSelection();
            // 1. Process new elements
            const changes = [];
            const groups = new Map();
            const originalElementsOrder = new Map(editor.page.elements.map(element => ([element.id, element[FIELDS.ORDER]])));
            const changedElementsOrder = new Map();
            const maxOrder = Math.max.apply(null, editor.page.elements.map(el => {
                return (!editor.page?.activeGroup || editor.page.activeGroup === el[FIELDS.GROUP]) ? el[FIELDS.ORDER] : 0;
            }));
            const bounds = getElementsBoundingRectangle(elements);
            const x = typeof dx === "number" ? dx : ((-1) * editor.page.translateX + editor.width / 2) - (bounds[1][0] - bounds[0][0])/ 2;
            const y = typeof dy === "number" ? dy : ((-1) * editor.page.translateY + editor.height / 2) - (bounds[1][1] - bounds[0][1]) / 2;
            debugger;
            const newElements = elements.map((element, index) => {
                // 1.1. Check if this element is part of a group
                if (elements.length > 1 && !editor.page?.activeGroup && !!element.group && !groups.has(element.group)) {
                    groups.set(element.group, generateRandomId());
                }
                // 1.2 Prepare new element configuration
                const newElement = {
                    ...element,
                    [FIELDS.VERSION]: 0,
                    [FIELDS.ID]: generateRandomId(),
                    x1: element.x1 + x,
                    x2: element.x2 + x,
                    y1: element.y1 + y,
                    y2: element.y2 + y,
                    [FIELDS.SELECTED]: true,
                    [FIELDS.GROUP]: group || editor.page?.activeGroup || groups.get(element.group) || null,
                    [FIELDS.ORDER]: maxOrder + index + 1,
                    [FIELDS.NAME]: "Copy of " + (element[FIELDS.NAME] || ""),
                };
                // 1.3 Check if this element has an onDuplicate listener defined
                const elementConfig = getElementConfig(element);
                if (elementConfig?.onDuplicate) {
                    elementConfig.onDuplicate(newElement, x, y);
                }
                // 1.4 Return the new element data
                return newElement;
            });
            // 2. Check if activeGroup is enabled
            if (editor.page?.activeGroup) {
                for (let i = maxOrder + 1; i < editor.page.elements.length; i++) {
                    editor.page.elements[i][FIELDS.ORDER] = i + newElements.length;
                    changedElementsOrder.set(editor.page.elements[i].id, editor.page.elements[i][FIELDS.ORDER]);
                }
            }
            // 3. insert new elements
            newElements.forEach(element => {
                editor.page.elements.push(element);
            });
            // 4.1 Register CREATE change
            changes.push({
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
            // 4.2 Register UPDATE change
            if (changedElementsOrder.size > 0) {
                changes.push({
                    type: CHANGES.UPDATE,
                    elements: Array.from(changedElementsOrder).map(entry => ({
                        id: entry[0],
                        prevValues: {
                            [FIELDS.ORDER]: originalElementsOrder.get(entry[0]),
                        },
                        newValues: {
                            [FIELDS.ORDER]: entry[1],
                        },
                    })),
                });
            }
            // 4.3 Register history change
            editor.addHistory(changes);
            // 5. Fix Elements order
            editor.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
        },

        // @description export elements as JSON
        exportElements: (elementsToExport = null) => {
            const elements = elementsToExport || editor.getElements();
            return {
                elements: elements,
                assets: elements.reduce((assets, element) => {
                    // Copy only assets in the current selection
                    if (element.assetId && editor.assets[element.assetId]) {
                        assets[element.assetId] = editor.assets[element.assetId];
                    }
                    return assets;
                }, {}),
                // background: editor.background,
            };
        },

        // @description duplicate provided elements
        duplicateElements: elements => {
            const bounds = getElementsBoundingRectangle(elements || []);
            return editor.importElements(elements, (bounds[1][0] + PASTE_OFFSET) - bounds[0][0], 0);
        },

        // @description lock elements
        lockElements: elements => {
            // 1. Get elements to lock
            const elementsToUpdate = elements.filter(el => !el.locked);
            // 2. Register history change
            editor.addHistory({
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
            editor.addHistory({
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
            return setElementsOrderInEditor(editor, elements, +1, false);
        },

        // @description send provided elements backward
        sendElementsBackward: elements => {
            return setElementsOrderInEditor(editor, elements, -1, false);
        },

        // @description bring provided elements to front
        bringElementsToFront: elements => {
            return setElementsOrderInEditor(editor, elements, +1, true);
        },

        // @description send provided elements to back
        sendElementsToBack: elements => {
            return setElementsOrderInEditor(editor, elements, -1, true);
        },

        // @description group elements in the current selection
        groupElements: elements => {
            const groupId = generateRandomId();
            const selectedElements = new Set(elements.map(element => element.id));
            const updatedElements = [...elements];
            const prevElementsOrder = new Map(editor.page.elements.map(element => {
                return [element.id, element[FIELDS.ORDER]];
            }));
            const prevElementsGroup = new Map(editor.page.elements.map(element => {
                return [element.id, element[FIELDS.GROUP] || null];
            }));
            const minOrder = Math.min(...elements.map(element => element[FIELDS.ORDER]));
            const maxOrder = Math.max(...elements.map(element => element[FIELDS.ORDER]));
            // TODO: we should check if there is an element that belongs to a non selected group?
            // 1. Find the elements index with the minimum and maximum order
            const maxOrderIndex = editor.page.elements.findIndex(element => element[FIELDS.ORDER] === maxOrder);
            const minOrderIndex = editor.page.elements.findIndex(element => element[FIELDS.ORDER] === minOrder);
            // 2. Fix the order of all elements between [minOrderIndex, maxOrderIndex] that are not selected
            let index = 0;
            for (let i = minOrderIndex + 1; i < maxOrderIndex; i++) {
                const element = editor.page.elements[i];
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
            editor.addHistory({
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
            editor.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
        },

        // @description ungroup elements
        ungroupElements: elements => {
            editor.updateElements(elements, [FIELDS.GROUP], [null], false);
        },

        // 
        // Create new elements
        //

        // @description add a new text element into editor
        addTextElement: (text, tx = null, ty = null) => {
            // editor.clearSelection();
            editor.setTool(TOOLS.SELECT);
            const x = tx ?? ((-1) * editor.page.translateX + editor.width / 2);
            const y = ty ?? ((-1) * editor.page.translateY + editor.height / 2);
            const element = createElement(ELEMENTS.TEXT);
            const elementConfig = getElementConfig(element);

            // We need to assign initial text values to this element
            Object.assign(element, {
                ...(elementConfig.initialize?.(editor.defaults) || {}),
                text: text,
                selected: true,
                [FIELDS.GROUP]: null,
            });
            const [textWidth, textHeight] = measureTextInElement(element, text || " ");
            // Override element position
            Object.assign(element, {
                x1: Math.floor((x - textWidth / 2)), // / GRID_SIZE) * GRID_SIZE,
                y1: Math.floor((y - textHeight / 2)), // / GRID_SIZE) * GRID_SIZE,
                x2: Math.ceil((x + textWidth / 2)), // / GRID_SIZE) * GRID_SIZE,
                y2: Math.ceil((y + textHeight / 2)), // / GRID_SIZE) * GRID_SIZE,
                textWidth: textWidth,
                textHeight: textHeight,
            });
            editor.addElements([element]);
            // this.update();
            return Promise.resolve(element);
        },

        // @description adds a new image into the editor as an element
        addImageElement: (image, tx = null, ty = null) => {
            // editor.clearSelection();
            editor.setTool(TOOLS.SELECT);
            return loadImage(image).then(img => {
                const x = tx ?? ((-1) * editor.page.translateX + editor.width / 2);
                const y = ty ?? ((-1) * editor.page.translateY + editor.height / 2);
                const element = createElement(ELEMENTS.IMAGE);
                const elementConfig = getElementConfig(element);
                Object.assign(element, {
                    ...(elementConfig.initialize?.(editor.defaults) || {}),
                    assetId: editor.addAsset(ASSETS.IMAGE, {
                        mimeType: image.substring(image.indexOf(":") + 1, image.indexOf(";")),
                        src: image,
                        width: img.width,
                        height: img.height,
                        size: image.length,
                    }),
                    x1: Math.floor((x - img.width / 2)), // / GRID_SIZE) * GRID_SIZE,
                    y1: Math.floor((y - img.height / 2)), // / GRID_SIZE) * GRID_SIZE,
                    x2: Math.ceil((x + img.width / 2)), // / GRID_SIZE) * GRID_SIZE,
                    y2: Math.ceil((y + img.height / 2)), // / GRID_SIZE) * GRID_SIZE,
                    selected: true,
                    [FIELDS.GROUP]: null,
                });
                editor.addElements([element]);
                // this.update();
                return element;
            });
        },

        // @description adds a new bookmark element
        addBookmarkElement: (src, tx = null, ty = null) => {
            // editor.clearSelection();
            editor.setTool(TOOLS.SELECT);
            return getLinkMetadata(src).then(linkMetadata => {
                const element = createElement(ELEMENTS.BOOKMARK);
                const elementConfig = getElementConfig(element);
                Object.assign(element, {
                    ...(elementConfig.initialize?.(editor.defaults) || {}),
                    assetId: editor.addAsset(ASSETS.BOOKMARK, linkMetadata),
                    x1: tx ?? ((-1) * editor.page.translateX + editor.width / 2),
                    y1: ty ?? ((-1) * editor.page.translateY + editor.height / 2),
                    selected: true,
                    [FIELDS.GROUP]: null,
                });
                elementConfig.onCreateEnd?.(element);
                editor.addElements([element]);
                return element;
            });
        },

        // @description add a new library item element
        // @DEPRECATED
        addLibraryElement: (LibraryComponent, tx = null, ty = null) => {
            editor.setTool(TOOLS.SELECT);
            const bounds = getElementsBoundingRectangle(LibraryComponent.elements);
            const group = generateRandomId();
            const x = (tx ?? ((-1) * editor.page.translateX + editor.width / 2)) - (bounds.x2 - bounds.x1)/ 2;
            const y = (ty ?? ((-1) * editor.page.translateY + editor.height / 2)) - (bounds.y2 - bounds.y1) / 2;
            const elements = LibraryComponent.elements.map(element => ({
                ...element,
                id: generateRandomId(),
                [FIELDS.GROUP]: group,
                [FIELDS.SELECTED]: true,
                [FIELDS.EDITING]: false,
                x1: element.x1 + x,
                x2: element.x2 + x,
                y1: element.y1 + y,
                y2: element.y2 + y,
            }));
            // we have to execute the onCreateEnd method for each element
            // elements.forEach(element => {
            //     return getElementConfig(element)?.onCreateEnd?.(element);
            // });
            editor.addElements(elements);
        },

        //
        // Selection api
        //

        // @description clear current selection
        clearSelection: () => {
            editor.page.elements.forEach(element => element.selected = false);
        },

        // @description get selected elements
        getSelection: () => {
            return editor.page.elements.filter(element => element.selected);
        },

        // @description set selected elements by elements ids
        setSelection: elements => {
            const selectedElements = new Set([elements].flat().map(el => el.id || el));
            const groups = new Set();
            // 1. set selected elements based on the provided ids
            editor.page.elements.forEach(element => {
                element.editing = false;
                element.selected = selectedElements.has(element.id);
                if (element.selected && !editor.page.activeGroup && element.group) {
                    groups.add(element.group);
                }
            });
            // 2. Select the elements based on the groups set
            if (!editor.page.activeGroup && groups.size > 0) {
                editor.page.elements.forEach(element => {
                    if (element.group && groups.has(element.group)) {
                        element.selected = true;
                    }
                });
            }
        },

        // @description set selected elements using a selection area
        setSelectionArea: selection => {
            const groups = new Set();
            // 1. select the elements using the selection area
            editor.page.elements.forEach(element => {
                element.editing = false;
                element.selected = false;
                if (!element.locked) {
                    if (element.x1 < selection.x2 && selection.x1 < element.x2) {
                        if (element.y1 < selection.y2 && selection.y1 < element.y2) {
                            element.selected = true;
                            if (element.group && !editor.page.activeGroup) {
                                groups.add(element.group);
                            }
                        }
                    }
                }
            });
            // 2. Select the elements based on the groups set
            if (!editor.page.activeGroup && groups.size > 0) {
                editor.page.elements.forEach(element => {
                    if (element.group && groups.has(element.group)) {
                        element.selected = true;
                    }
                });
            }
        },

        // @description remove selected elements
        // @deprecated use editor.removeElements() instead
        removeSelection: () => {
            return editor.removeElements(editor.getSelection());
        },

        // @description get an snapshot from the current selection
        // @deprecated use map instead
        snapshotSelection: () => {
            return editor.getSelection().map(el => ({...el}));
        },

        // @description update a key and a value in the current selection
        // @deprecated use editor.updateElements instead
        updateSelection: (key, value) => {
            return editor.updateElements(editor.getSelection(), [key], [value], false);
        },

        //
        // History API
        //

        // @description Get current history
        getHistory: () => {
            return editor.page.history;
        },

        // @description Clear history
        clearHistory: () => {
            editor.page.history = [];
            editor.page.historyIndex = 0;
        },

        // @description Adds a new history item
        addHistory: entry => {
            // 1. Check the current history index
            if (editor.page.historyIndex > 0) {
                editor.page.history = editor.page.history.slice(editor.page.historyIndex);
                editor.page.historyIndex = 0;
            }
            // 2. Check for updating the same elements and the same keys
            if (entry.ids && editor.page.history.length > 0) {
                const last = editor.page.history[0];
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
            editor.page.history.unshift(entry);
        },

        // @description Perform an undo change to the editor
        undo: () => {
            if (editor.page.historyIndex < editor.page.history.length) {
                // const entry = editor.page.history[editor.page.historyIndex];
                [editor.page.history[editor.page.historyIndex]].flat().forEach(entry => {
                    if (entry.type === CHANGES.CREATE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        editor.page.elements = editor.page.elements.filter(el => {
                            return !removeElements.has(el.id);
                        });
                    } else if (entry.type === CHANGES.REMOVE) {
                        // We need to restore elements in the current order
                        entry.elements.forEach(el => {
                            editor.page.elements.splice(el.prevValues[FIELDS.ORDER], 0, {...el.prevValues});
                        });
                    } else if (entry.type === CHANGES.UPDATE) {
                        entry.elements.forEach(item => {
                            // 1. Update element values
                            const element = editor.page.elements.find(el => el.id === item.id);
                            Object.assign(element, item.prevValues);
                            // 2. Apply element update
                            const changedKeys = new Set(Object.keys(item.prevValues));
                            getElementConfig(element)?.onUpdate?.(element, changedKeys);
                        });
                    }
                });
                // Sort elements by order
                editor.page.elements.sort((a, b) => a[FIELDS.ORDER] - b[FIELDS.ORDER]);
                editor.page.elements.forEach(el => {
                    el.selected = false;
                    el.editing = false;
                });
                editor.page.historyIndex = editor.page.historyIndex + 1;
            }
        },

        // @description Perform a redo action to the editor
        redo: () => {
            if (editor.page.historyIndex > 0 && editor.page.history.length > 0) {
                editor.page.historyIndex = editor.page.historyIndex - 1;
                // const entry = editor.page.history[editor.page.historyIndex];
                [editor.page.history[editor.page.historyIndex]].flat().forEach(entry => {
                    if (entry.type === CHANGES.CREATE) {
                        entry.elements.forEach(el => {
                            editor.page.elements.splice(el.newValues[FIELDS.ORDER], 0, {...el.newValues});
                        });
                    } else if (entry.type === CHANGES.REMOVE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        editor.page.elements = editor.page.elements.filter(el => !removeElements.has(el.id));
                    } else if (entry.type === CHANGES.UPDATE) {
                        entry.elements.forEach(item => {
                            // 1. Update element values
                            const element = editor.page.elements.find(el => el.id === item.id);
                            Object.assign(element, item.newValues);
                            // 2. Apply element update
                            const changedKeys = new Set(Object.keys(item.newValues));
                            getElementConfig(element)?.onUpdate?.(element, changedKeys);
                        });
                    }
                });
                // sort elements by order
                editor.page.elements
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
            return !(editor.page.historyIndex >= editor.page.history.length);
        },

        // @description Check if redo action is enabled
        canRedo: () => {
            return !(editor.page.historyIndex === 0 || editor.page.history.length < 1);
        },

        //
        // Zoom API
        //

        // @description get current zoom
        getZoom: () => editor.page.zoom,

        // @description set current zoom
        setZoom: (value = ZOOM_DEFAULT) => {
            const newZoom = Math.round(parseZoomValue(value, true) * 10) / 10;
            const {translateX, translateY} = getTranslateCoordinatesForNewZoom(newZoom, {
                width: editor.width,
                height: editor.height,
                translateX: editor.page.translateX,
                translateY: editor.page.translateY,
                zoom: editor.page.zoom,
            });
            // Update editor values
            editor.page.zoom = newZoom;
            editor.page.translateX = translateX;
            editor.page.translateY = translateY;
        },

        // @description reset zoom to the default value
        resetZoom: () => editor.setZoom(ZOOM_DEFAULT),

        // @description fit zoom to the provided selection
        fitZoomToSelection: (elements = []) => {
            const selection = elements.length > 0 ? elements : editor.page.elements;
            if (selection.length > 0) {
                const {zoom, translateX, translateY} = getZoomToFitElements(selection, {
                    width: editor.width,
                    height: editor.height,
                });
                editor.page.zoom = zoom;
                editor.page.translateX = translateX;
                editor.page.translateY = translateY;
            }
        },

        //
        // Editor size api
        // 

        // @description set editor size
        setSize: (newWidth = 0, newHeight = 0) => {
            editor.width = +newWidth;
            editor.height = +newHeight;
        },

        //
        // Clipboard api
        //

        // @description Copy current selection to clipboard
        copyElementsToClipboard: elements => {
            const data = editor.exportElements(elements);  
            return copyTextToClipboard(`${CLIPBOARD_KEY}${JSON.stringify(data)}`);
        },

        // @description Copy current selection to clipboard and remove selection
        cutElementsToClipboard: elements => {
            return editor.copyElementsToClipboard(elements).then(() => {
                return editor.removeElements(elements);
            });
        },

        // @description Get data from clipboard and add it to the editor
        pasteElementsFromClipboard: (event = null, point) => {
            const x = point ? (point.x - editor.page.translateX) / editor.page.zoom : null;
            const y = point ? (point.y - editor.page.translateY) / editor.page.zoom : null;
            return getClipboardContents(event).then(items => {
                for (let i = 0; i < items?.length; i++) {
                    const item = items[i];
                    // Check for image data (image/png, image/jpg)
                    if (item.types.includes("image/png") || item.types.includes("image/jpeg")) {
                        const imageType = item.types.includes("image/png") ? "image/png" : "image/jpeg";
                        return item.getType(imageType)
                            .then(blob => blobToDataUrl(blob))
                            .then(image => {
                                return editor.addImageElement(image, x, y);
                            });
                    }
                    // Check for text data
                    else if (item.types.includes("text/plain")) {
                        return item.getType("text/plain")
                            .then(blob => blob.text())
                            .then(content => {
                                return parseTextDataToEditor(editor, content, x, y);
                            });
                    }
                }
            });
        },

        //
        // Tool API
        //

        // @description change the active tool
        setTool: newTool => {
            editor.state.tool = newTool;
            editor.getElements().forEach(element => {
                element.selected = false;
                element.editing = false;
            });
        },

        // @description get the current active tool
        getTool: () => editor.state.tool,
    };

    return editor;
};

// @description convert a region into editor coordinates
export const convertRegionToEditorCoordinates = (editor, region) => {
    return {
        x1: (region.x1 - editor.page.translateX) / editor.page.zoom,
        y1: (region.y1 - editor.page.translateY) / editor.page.zoom,
        x2: (region.x2 - editor.page.translateX) / editor.page.zoom,
        y2: (region.y2 - editor.page.translateY) / editor.page.zoom,
    };
};
