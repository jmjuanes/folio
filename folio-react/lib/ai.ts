import { ELEMENTS } from "../constants.js";
import { getElementConfig, createElement } from "./elements.js";

export const parseElementsFromAiResponse = (responseElements: any[]): any[] => {
    return (responseElements ?? [])
        .map((element: any) => {
            const config = getElementConfig(element);
            if (element?.type && config) {
                return {
                    ...createElement(element.type),
                    ...config.initialize(element),
                    ...element,
                };
            }
            // not valid element
            return null;
        })
        .filter(Boolean)
        .map(element => {
            // 1. check for drawing element --> convert absolute points to relative
            if (element.type === ELEMENTS.DRAW) {
                const config = getElementConfig(element);
                if (config && element.points?.length > 0) {
                    // Ensure points are objects {x, y} (handle both tuples and objects for flexibility)
                    element.points = element.points.map((point: any) => {
                        if (Array.isArray(point)) {
                            return { x: point[0], y: point[1] };
                        }
                        return point;
                    });
                    // Save the origin from the first point before any mutation
                    const originX = element.points[0].x;
                    const originY = element.points[0].y;
                    // Convert all points from absolute to relative (offset from origin)
                    element.points = element.points.map((point: any) => {
                        return { x: point.x - originX, y: point.y - originY };
                    });
                    // Set initial position to the origin point
                    element.x1 = originX;
                    element.y1 = originY;
                    // Let onCreateEnd recalculate x1, y1, x2, y2 and drawWidth/drawHeight
                    config.onCreateEnd?.(element);
                }
            }
            return element;
        });
}
