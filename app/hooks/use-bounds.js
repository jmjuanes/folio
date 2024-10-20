import {ACTIONS} from "../constants.js";
import {getRectanglePath} from "../utils/paths.js";
import {getElementConfig, getElementsBounds} from "../elements.js";
import {useScene} from "../contexts/scene.jsx";

export const useBounds = ({action, tool}) => {
    const scene = useScene();
    const bounds = [];
    let hasCustomBounds = false;
    if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = scene.getSelection();
        // 1. Check for active group
        if (scene.page.activeGroup) {
            const elementsInGroup = scene.getElements().filter(el => el.group === scene.page.activeGroup);
            if (elementsInGroup.length > 0) {
                const p = getElementsBounds(elementsInGroup);
                bounds.push({
                    path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
                    strokeWidth: 2,
                    strokeDasharray: 5,
                });
            }
        }
        // 2. Check if there is only one element in the selection
        if (selectedElements.length === 1) {
            const elementConfig = getElementConfig(selectedElements[0]);
            if (typeof elementConfig.getBounds === "function") {
                (elementConfig.getBounds(selectedElements[0]) || []).map(b => {
                    return bounds.push(b);
                });
                hasCustomBounds = true;
            }
        }
        // 3. Generate default bounds for selected elements
        if (selectedElements.length > 0) {
            const hasGroupInSelection = selectedElements.some(el => el.group && el.group !== scene.page.activeGroup);
            if (hasGroupInSelection) {
                const groups = new Set(selectedElements.map(el => el.group).filter(g => !!g));
                Array.from(groups).forEach(group => {
                    const elements = selectedElements.filter(el => el.group === group);
                    const p = getElementsBounds(elements);
                    bounds.push({
                        path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
                        strokeWidth: 2,
                        strokeDasharray: 5,
                    });
                });
            }
            // Note: we have to fix rectangle bounds for arrow elements
            if (!hasCustomBounds) {
                const p = getElementsBounds(selectedElements);
                bounds.push({
                    path: getRectanglePath([[p.x1, p.y1], [p.x2, p.y1], [p.x2, p.y2], [p.x1, p.y2]]),
                    strokeWidth: 4,
                });
            }
        }
    }
    // Return bounds
    return bounds;
};
