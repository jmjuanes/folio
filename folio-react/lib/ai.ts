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
                    // Convert point objects {x, y} to tuples [x, y] if needed
                    element.points = element.points.map((point: any) => {
                        if (Array.isArray(point)) {
                            return point;
                        }
                        return [point.x, point.y];
                    }) as [number, number][];
                    // Save the origin from the first point before any mutation
                    const originX = element.points[0][0];
                    const originY = element.points[0][1];
                    // Convert all points from absolute to relative (offset from origin)
                    element.points = element.points.map((point: [number, number]) => {
                        return [point[0] - originX, point[1] - originY];
                    }) as [number, number][];
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
