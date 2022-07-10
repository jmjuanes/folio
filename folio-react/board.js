import {
    ELEMENT_TYPES,
    ELEMENT_CHANGE_TYPES,
} from "./constants.js";
import {getAbsolutePositions} from "./utils/math.js";

export const createBoard = () => {
    const ctx = {
        activeElement: null,
        activeGroup: null,
        elements: [],
        load: () => null,
        export: () => null,
        addElement: el => ctx.elements.unshift(el),
        removeElement: el => ctx.elements = ctx.elements.filter(element => el.id !== element.id),

        getSelectedElements: () => ctx.elements.filter(el => el.selected),
        setSelectedElements: region => {
            const [sxStart, sxEnd] = getAbsolutePositions(region.x, region.width);
            const [syStart, syEnd] = getAbsolutePositions(region.y, region.height);
            const selectedGroups = new Set();
            ctx.elements.forEach(element => {
                if (element.type !== ELEMENT_TYPES.SELECTION && element.type !== ELEMENT_TYPES.SCREENSHOT) {
                    if (!ctx.activeGroup && element.group && selectedGroups.has(element.group)) {
                        element.selected = true;
                        return;
                    }
                    // Get element absolute positions
                    const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                    const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                    // Set if this element is selected
                    element.selected = sxStart <= xStart && syStart <= yStart && xEnd <= sxEnd && yEnd <= syEnd;

                    // Add the group of this element to the list of groups
                    if (!ctx.activeGroup && element.group && element.selected) {
                        selectedGroups.add(element.group);
                    }
                }
            });
            // Check for adding other elements in groups
            if (selectedGroups.size > 0) {
                ctx.elements.forEach(element => {
                    if (element.group && selectedGroups.has(element.group)) {
                        element.selected = true;
                    }
                });
            }
        },
        clearSelectedElements: () => ctx.elements.forEach(el => el.selected = false),
        removeSelectedElements: () => ctx.elements = ctx.elements.filter(el => !el.selected),
        snapshotSelectedElements: () => {
            return ctx.getSelectedElements().map(element => ({
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
            }));
        },
        updateSelectedElements: (key, value) => {
            ctx.getSelectedElements().forEach(element => {
                element[key] = value;
            });
        },
        cloneSelectedElements: null,
         
        // Board selection API
        selection: null,
        getSelection: () => ctx.selection,
        initSelection: (x, y) => {
            ctx.selection = {x, y, width: 0, height: 0};
        },
        updateSelection: (width, height) => {
            ctx.selection.width = width;
            ctx.selection.height = height;
        },
        applySelection: () => ctx.selection && ctx.setSelectedElements(ctx.selection),
        clearSelection: () => ctx.selection = null,
         
        // Board history API
        history: [],
        historyIndex: 0,
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
            return addHistoryEntry({
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
    };
    return ctx;
};
