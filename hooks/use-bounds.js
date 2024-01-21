import {ACTIONS} from "@lib/constants.js";
import {getRectangleBounds} from "@lib/utils/math.js";
import {getRectanglePath} from "@lib/utils/paths.js";
import {useBoard} from "@components/contexts/board.jsx";
import {getElementConfig} from "@elements/index.jsx";

export const useBounds = () => {
    const bounds = [];
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
        // Check if there is only one element in the selection
        if (selectedElements.length === 1) {
            const elementConfig = getElementConfig(selectedElements[0]);
            if (typeof elementConfig.getBounds === "function") {
                return elementConfig.getBounds(selectedElements[0]);
            }
        }
        // Generate default bounds for selected elements
        if (selectedElements.length > 0) {
            const p = getRectangleBounds(selectedElements);
            bounds.push({
                path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
            });
        }
    }
    // Return bounds
    return bounds;
};
