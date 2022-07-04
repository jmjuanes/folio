import {registerSelectionUpdate} from "./history.js";
import {getAbsolutePositions} from "./utils/math.js";
import {generateID} from "./utils/index.js";

export const groupSelection = ctx => {
    const group = generateID();
    registerSelectionUpdate(ctx, ["group"], [group], false);
    ctx.selection.forEach(element => element.group = group);
    ctx.currentGroup = null;
};

export const ungroupSelection = ctx => {
    registerSelectionUpdate(ctx, ["group"], [null], false);
    ctx.selection.forEach(element => element.group = null);
    ctx.currentGroup = null;
};

export const getGroupsInSelection = ctx => {
    const groups = new Set();
    ctx.selection.forEach(el => el.group && groups.add(el.group));
    return Array.from(groups);
};

export const selectAllElementsInGroup = (ctx, id) => {
    ctx.elements.forEach(element => element.selected = element.group === id || element.selected);
};

export const getGroup = (ctx, id) => {
    let xStart = Infinity, yStart = Infinity, xEnd = 0, yEnd = 0;
    ctx.elements.forEach(el => {
        if (el.group === id) {
            const [x0, x1] = getAbsolutePositions(el.x, el.width);
            const [y0, y1] = getAbsolutePositions(el.y, el.height);
            xStart = Math.min(x0, xStart);
            xEnd = Math.max(x1, xEnd);
            yStart = Math.min(y0, yStart);
            yEnd = Math.max(y1, yEnd);
        }
    });
    return {
        // id: id,
        // elements: [],
        x: xStart,
        y: yStart,
        width: Math.abs(xEnd - xStart),
        height: Math.abs(yEnd - yStart),
    };
};
