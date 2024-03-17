import {
    ACTIONS,
    GROUP_BOUNDS_COLOR,
    GROUP_ACTIVE_BOUNDS_COLOR,
} from "../lib/constants";
import {getRectangleBounds} from "../lib/utils/math.js";
import {getRectanglePath} from "../lib/utils/paths.js";
import {getElementConfig} from "../lib/elements.js";
import {useScene} from "../contexts/scene.jsx";

export const useBounds = ({action, tool}) => {
    const scene = useScene();
    const bounds = [];

    if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = scene.getSelection();
        // 1. Check for active group
        if (scene.page.activeGroup) {
            const elementsInGroup = scene.getElements().filter(el => el.group === scene.page.activeGroup);
            if (elementsInGroup.length > 0) {
                const p = getRectangleBounds(elementsInGroup);
                bounds.push({
                    path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
                    strokeColor: GROUP_ACTIVE_BOUNDS_COLOR,
                    strokeDasharray: 5,
                });
            }
        }
        // 2. Check if there is only one element in the selection
        if (selectedElements.length === 1) {
            const elementConfig = getElementConfig(selectedElements[0]);
            if (typeof elementConfig.getBounds === "function") {
                return elementConfig.getBounds(selectedElements[0]);
            }
        }

        // 3. Generate default bounds for selected elements
        if (selectedElements.length > 0) {
            const hasGroupInSelection = selectedElements.some(el => el.group && el.group !== scene.page.activeGroup);
            if (hasGroupInSelection) {
                const groups = new Set(selectedElements.map(el => el.group).filter(g => !!g));
                Array.from(groups).forEach(group => {
                    const elements = selectedElements.filter(el => el.group === group);
                    const p = getRectangleBounds(elements);
                    bounds.push({
                        path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
                        strokeColor: GROUP_BOUNDS_COLOR,
                        strokeDasharray: 5,
                    });
                });
            }
            const p = getRectangleBounds(selectedElements);
            bounds.push({
                path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
            });
        }
    }
    // Return bounds
    return bounds;
};
