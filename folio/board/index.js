import {ELEMENT_CHANGE_TYPES} from "../constants.js";
import {generateID} from "../utils/index.js";
import {getDataFromClipboard} from "./data.js";

export const createBoard = initialElements => {
    const ctx = {
        isReadOnly: false,
        activeElement: null,
        activeGroup: null,
        elements: initialElements || [],
        clear: () => {
            ctx.elements = [];
            ctx.activeElement = null;
            ctx.activeGroup = null;
            ctx.clearHistory();
        },
        loadElements: elements => {
            ctx.clear();
            ctx.elements = elements.map(element => ({
                ...element,
                selected: false,
            }));
        },
        exportElements: () => {
            return ctx.elements.map(el => ({
                ...el,
                selected: false,
            }));
        },
        addElement: el => ctx.elements.push(el),
        createElement: (tool, x, y) => {
            const element = {};
        },
        removeElement: el => ctx.elements = ctx.elements.filter(element => el.id !== element.id),
        getElements: () => ctx.elements,
        getElementById: id => ctx.elements.find(el => el.id === id),

        // Selection API
        getSelectedElements: () => ctx.elements.filter(el => !!el.selected),
        clearSelectedElements: () => ctx.elements.forEach(el => el.selected = false),
        removeSelectedElements: () => ctx.elements = ctx.elements.filter(el => !el.selected),
        exportSelectedElements: () => {
            return ctx.getSelectedElements().map(el => ({
                ...el,
                selected: false,
            }));
        },
        setSelectedElements: region => {
            // TODO
        },
        snapshotSelectedElements: () => ctx.getSelectedElements().map(el => ({...el})),
        updateSelectedElements: (key, value) => {
            ctx.getSelectedElements().forEach(element => {
                element[key] = value;
            });
        },
        cloneSelectedElements: null,
        copySelectedElements: () => ctx.getSelectedElements().reverse(),
        pasteElements: elements => {
            ctx.clearSelectedElements();
            if (elements?.length > 0) {
                // const groupsMap = new Map();
                elements.forEach(element => {
                    // if (elements.length > 1 && el.group && !groupsMap.has(el.group)) {
                    //     groupsMap.set(el.group, generateID());
                    // }
                    ctx.addElement({
                        ...element,
                        id: generateID(),
                        selected: true,
                        //group: ctx.activeGroup || groupsMap.get(el.group) || null,
                    });
                });
                ctx.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.CREATE,
                    elements: elements.map(el => ({
                        id: el.id,
                        prevValues: null,
                        newValues: {...el},
                    })),
                });
            }
        },

        // Board groups API
        getElementsInGroup: group => {
            return ctx.elements.filter(el => el.group && el.group === group);
        },
        getElementsInActiveGroup: () => {
            return ctx.activeGroup ? ctx.getElementsInGroup(ctx.activeGroup) : [];
        },
         
        // Board history API
        history: [],
        historyIndex: 0,
        clearHistory: () => {
            ctx.history = [];
            ctx.historyIndex = 0;
        },
        addHistoryEntry: entry => {
            if (ctx.historyIndex > 0) {
                ctx.history = ctx.history.slice(ctx.historyIndex);
                ctx.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && ctx.history.length > 0) {
                const last = ctx.history[0];
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
            ctx.history.unshift(entry);
        },
        registerSelectionUpdate: (keys, values, groupChanges) => {
            const selectedElements = ctx.getSelectedElements();
            ctx.addHistoryEntry({
                type: ELEMENT_CHANGE_TYPES.UPDATE,
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
            return ctx.addHistoryEntry({
                type: ELEMENT_CHANGE_TYPES.REMOVE,
                elements: ctx.getSelectedElements().map(element => ({
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                })),
            });
        },
        registerElementCreate: element => {
            return ctx.addHistoryEntry({
                type: ELEMENT_CHANGE_TYPES.CREATE,
                elements: [{
                    id: element.id,
                    prevValues: null,
                    newValues: {...element},
                }],
            });
        },
        registerElementRemove: element => {
            return ctx.addHistoryEntry({
                type: ELEMENT_CHANGE_TYPES.REMOVE,
                elements: [{
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                }],
            });
        },
        undo: () => {
            if (ctx.historyIndex < ctx.history.length) {
                const entry = ctx.history[ctx.historyIndex];
                if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    ctx.elements = ctx.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                    entry.elements.forEach(el => ctx.elements.unshift({...el.prevValues}));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(ctx.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                ctx.historyIndex = ctx.historyIndex + 1;
                ctx.activeGroup = null;
                ctx.elements.forEach(el => el.selected = false);
            }
        },
        redo: () => {
            if (ctx.historyIndex > 0 && ctx.history.length > 0) {
                ctx.historyIndex = ctx.historyIndex - 1;
                const entry = ctx.history[ctx.historyIndex];
                if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                    entry.elements.forEach(el => ctx.elements.unshift({...el.newValues}));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    ctx.elements = ctx.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(ctx.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                ctx.activeGroup = null;
                ctx.elements.forEach(el => el.selected = false);
            }
        },
        isUndoDisabled: () => ctx.historyIndex >= ctx.history.length,
        isRedoDisabled: () => ctx.historyIndex === 0 || ctx.history.length < 1,

        // Cut / Copy / Paste actions
        cut: () => {
            // First copy all items and then remove selection
            return ctx.copy().then(() => {
                if (!ctx.isReadOnly) {
                    ctx.removeSelectedElements();
                    ctx.registerSelectionRemove();
                }
            });
        },
        copy: () => {
            const elements = board.current.copySelectedElements();
            const data = `folio:::${JSON.stringify(elements)}`;
            if (window?.navigator?.clipboard) {
                return navigator.clipboard.writeText(data);
            }
            // If clipboard is not available
            return Promise.reject(new Error("Clipboard not available"));
        },
        paste: event => {
            if (ctx.isReadOnly) {
                return Promise.reject(new Error("Board is read-only"));
            }
            ctx.clearSelectedElements();
            // ctx.activeGroup = null;
            return getDataFromClipboard(event).then(data => {
                if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
                    const elements = JSON.parse(data.content.split("folio:::")[1].trim());
                    // elements.forEach(el => {
                    //     el.x = el.x + index * (state.gridEnabled ? state.gridSize : 10);
                    //     el.y = el.y + index * (state.gridEnabled ? state.gridSize : 10);
                    // });
                    ctx.pasteElements(elements || []);
                    return true;
                }
            });
        },
    };
    return ctx;
};
