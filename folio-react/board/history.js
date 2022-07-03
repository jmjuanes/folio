import {ELEMENT_CHANGE_TYPES} from "../constants.js";

export const addHistoryEntry = (ctx, entry) => {
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
};

export const registerSelectionUpdate = (ctx, keys, values, groupChanges) => {
    addHistoryEntry(ctx, {
        type: ELEMENT_CHANGE_TYPES.UPDATE,
        ids: groupChanges && ctx.selection.map(el => el.id).join(","),
        keys: groupChanges && keys.join(","),
        elements: ctx.selection.map(element => ({
            id: element.id,
            prevValues: Object.fromEntries(keys.map(key => [key, element[key]])),
            newValues: Object.fromEntries(keys.map((key, index) => [key, values[index]])),
        })),
    });
};

export const registerSelectionRemove = ctx => {
    addHistoryEntry(ctx, {
        type: ELEMENT_CHANGE_TYPES.REMOVE,
        elements: ctx.selection.map(element => ({
            id: element.id,
            prevValues: {...element},
            newValues: null,
        })),
    });
};

export const registerElementCreate = (ctx, element) => {
    addHistoryEntry(ctx, {
        type: ELEMENT_CHANGE_TYPES.CREATE,
        elements: [{
            id: element.id,
            prevValues: null,
            newValues: {...element},
        }],
    });
};

export const registerElementRemove = (ctx, element) => {
    addHistoryEntry(ctx, {
        type: ELEMENT_CHANGE_TYPES.REMOVE,
        elements: [{
            id: element.id,
            prevValues: {...element},
            newValues: null,
        }],
    });
};
