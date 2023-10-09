import {getRectangleBounds} from "../utils/math.js";
import {ACTIONS} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useBounds = () => {
    const board = useBoard();
    const action = board.activeAction;
    if (!board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        // const selectedGroups = new Set();
        // if (!board.activeGroup) {
        //     board.elements.forEach(el => el.selected && el.group && selectedGroups.add(el.group));
        // }
        const selectedElements = board.elements.filter(el => el.selected);
        // Generate bounds for active group
        // const groups = board.activeGroup ? [board.activeGroup] : Array.from(selectedGroups);
        // if (groups.length > 0) {
        //     groups.forEach(group => {
        //         return bounds.push({
        //             ...getRectangleBounds(board.elements.filter(el => el.group === group)),
        //             strokeColor: board.activeGroup ? ACTIVE_GROUP_BOUNDS_STROKE_COLOR : GROUP_BOUNDS_STROKE_COLOR,
        //             strokeDasharray: GROUP_BOUNDS_STROKE_DASHARRAY,
        //         });
        //     });
        // }
        // Generate bounds for selected elements
        const length = selectedElements.length;
        if (length > 1 || (length === 1 && selectedElements[0].locked)) {
            return getRectangleBounds(selectedElements);
        }
    }
    // No bounds available
    return null;
};
