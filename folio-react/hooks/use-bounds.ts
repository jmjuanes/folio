import { TOOLS } from "../constants.js";
import { getRectanglePath } from "../utils/paths.js";
import { getElementBounds, getElementsBoundingRectangle } from "../lib/elements.js";
import { useEditor } from "../contexts/editor.jsx";

export type BoundSegment = {
    path: string;
    fillColor?: string;
    strokeWidth?: number | string | null;
    strokeDasharray?: number | null;
    strokeColor?: string;
};

// alias to generate the rectangle path from two points
const getRectanglePathFromPoints = (p1: number[], p2: number[]): string => {
    return getRectanglePath([[p1[0], p1[1]], [p2[0], p1[1]], [p2[0], p2[1]], [p1[0], p2[1]]]);
};

export const useBounds = (): BoundSegment[] => {
    const editor = useEditor();
    const bounds: BoundSegment[] = [];
    let hasCustomBounds = false;
    if (editor.state.tool === TOOLS.SELECT) {
        const selectedElements = editor.getSelection();
        // 1. Check for active group
        if (editor.page.activeGroup) {
            const elementsInGroup = editor.getElements().filter(el => el.group === editor.page.activeGroup);
            if (elementsInGroup.length > 0) {
                const p = getElementsBoundingRectangle(elementsInGroup);
                bounds.push({
                    path: getRectanglePathFromPoints(p[0], p[1]),
                    strokeWidth: 2,
                    strokeDasharray: 5,
                });
            }
        }
        // 2. Check if there is only one element in the selection
        if (selectedElements.length === 1) {
            (getElementBounds(selectedElements[0]) || []).forEach((elementBound: BoundSegment) => {
                bounds.push(elementBound);
                hasCustomBounds = true;
            });
        }
        // 3. Generate default bounds for selected elements
        if (selectedElements.length > 0) {
            const hasGroupInSelection = selectedElements.some(el => el.group && el.group !== editor.page.activeGroup);
            if (hasGroupInSelection) {
                const groups = new Set(selectedElements.map(el => el.group).filter(g => !!g));
                Array.from(groups).forEach(group => {
                    const elements = selectedElements.filter(el => el.group === group);
                    const p = getElementsBoundingRectangle(elements);
                    bounds.push({
                        path: getRectanglePathFromPoints(p[0], p[1]),
                        strokeWidth: 2,
                        strokeDasharray: 5,
                    });
                });
            }
            // Note: we have to fix rectangle bounds for arrow elements
            if (!hasCustomBounds) {
                const p = getElementsBoundingRectangle(selectedElements);
                bounds.push({
                    path: getRectanglePathFromPoints(p[0], p[1]),
                    strokeWidth: 4,
                });
            }
        }
    }
    // Return bounds
    return bounds;
};
