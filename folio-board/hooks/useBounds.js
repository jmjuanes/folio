import {getRectangleBounds} from "folio-core";
import {ACTIONS} from "../constants.js";
import {GROUP_BOUNDS_STROKE_COLOR, GROUP_BOUNDS_STROKE_DASHARRAY} from "../constants.js";
import {ACTIVE_GROUP_BOUNDS_STROKE_COLOR} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useBounds = () => {
    const board = useBoard();
    const action = board.activeAction;
    const bounds = [];
    if (!board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedGroups = new Set();
        if (!board.activeGroup) {
            board.elements.forEach(el => el.selected && el.group && selectedGroups.add(el.group));
        }
        const selectedElements = board.elements.filter(el => {
            return !!el.selected || (el.group && selectedGroups.has(el.group));
        });
        // Generate bounds for active group
        const groups = board.activeGroup ? [board.activeGroup] : Array.from(selectedGroups);
        if (groups.length > 0) {
            groups.forEach(group => {
                return bounds.push({
                    ...getRectangleBounds(board.elements.filter(el => el.group === group)),
                    strokeColor: board.activeGroup ? ACTIVE_GROUP_BOUNDS_STROKE_COLOR : GROUP_BOUNDS_STROKE_COLOR,
                    strokeDasharray: GROUP_BOUNDS_STROKE_DASHARRAY,
                });
            });
        }
        // Generate bounds for selected elements
        if (selectedElements.length > 1) {
            bounds.push({
                ...getRectangleBounds(selectedElements),
            });
        }
    }
    // Return generated bounds
    return bounds;
};
