import {ELEMENT_TYPES} from "./constants.js";
import {getAbsolutePositions} from "./utils/math.js";

export const removeSelection = ctx => {
    ctx.elements = ctx.elements.filter(element => !element.selected);
    ctx.selection = [];
    if (ctx.currentGroup && !ctx.elements.some(el => el.group === ctx.currentGroup)) {
        ctx.currentGroup = null;
    }
};

export const clearSelection = ctx => {
    ctx.elements.forEach(element => element.selected = false);
    ctx.selection = [];
};

export const getSelection = ctx => {
    return ctx.elements.filter(element => element.selected);
};

export const isSelectionLocked = ctx => {
    return ctx.selection.every(element => element.locked);
};

export const setSelection = (ctx, selection) => {
    const [sxStart, sxEnd] = getAbsolutePositions(selection.x, selection.width);
    const [syStart, syEnd] = getAbsolutePositions(selection.y, selection.height);
    const selectedGroups = new Set();

    ctx.elements.forEach(element => {
        if (element.type !== ELEMENT_TYPES.SELECTION && element.type !== ELEMENT_TYPES.SCREENSHOT) {
            if (!ctx.currentGroup && element.group && selectedGroups.has(element.group)) {
                element.selected = true;
                return;
            }
            // Get element absolute positions
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            // Set if this element is selected
            element.selected = sxStart <= xStart && syStart <= yStart && xEnd <= sxEnd && yEnd <= syEnd;

            // Add the group of this element to the list of groups
            if (!ctx.currentGroup && element.group && element.selected) {
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
};

// Create a snapshot of the selection
export const snapshotSelection = selection => {
    return selection.map(element => ({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
    }));
};
