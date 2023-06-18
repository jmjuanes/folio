import {EPSILON, POLYGON} from "../constants.js";
import {rotatePoints, rotateLines} from "./math.js";

export const getPolygonPath = (type, width, height) => {
    if (type === POLYGON.RECTANGLE) {
        return [[
            0, 0], [width, 0], [width, height], [0, height],
        ];
    }
    else if (type === POLYGON.DIAMONG) {
        return [
            [width/2,0], [width,height/2], [width/2,height], [0,height/2],
        ];
    }
    else if (type === POLYGON.TRIANGLE) {
        return [
            [0,height], [width/2,0], [width,height],
        ];
    }
    // Fallback
    return [];
};

export const getPolygonHatchPath = (polygon, center, angle, gap) => {
    // 1. Rotate polygon with the provided angle
    const egdes = rotateLines(polygon, center, angle)
        // .sort((a, b) => b[0] - a[0])
        .map(edge => edge.sort((a, b) => b[1] - a[1]));
    // 2. Get start and end values for the y axis
    const yStart = Math.min.apply(null, edges.map(edge => edge[0][1]));
    const yEnd = Math.max.apply(null, edges.map(edge => edge[1][1]));
    // 3. Generate lines
    const lines = [];
    for (let y = yStart; y < yEnd; y = y + gap) {
        const xPoints = new Set();
        edges.forEach(([a, b]) => {
            if (a[1] <= y && y <= b[1] && b[1] - a[1] > EPSILON) {
                xPoints.add(a[0] + ((b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])));
            }
        });
        // Save lines
        if (xPoints.size === 2) {
            lines.push(Array.from(xPoints).map(x => [x, y]));
        }
    }
    // 4. Rotate back lines
    return rotateLines(lines, center, -angle);
};
