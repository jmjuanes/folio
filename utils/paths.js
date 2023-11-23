import {EPSILON, POLYGON} from "../constants.js";
import {rotateLines} from "./math.js";

export const getPolygonPath = (type, width, height) => {
    if (type === POLYGON.RECTANGLE) {
        return [
            [[0, 0], [width, 0]], 
            [[width, 0], [width, height]],
            [[width, height], [0, height]],
            [[0, height], [0, 0]],
        ];
    }
    else if (type === POLYGON.DIAMOND) {
        return [
            [[width/2, 0], [width, height/2]],
            [[width, height/2], [width/2, height]],
            [[width/2, height], [0, height/2]],
            [[0, height/2], [width/2, 0]],
        ];
    }
    else if (type === POLYGON.TRIANGLE) {
        return [
            [[0, height], [width/2, 0]],
            [[width/2 ,0], [width, height]],
            [[width, height], [0, height]],
        ];
    }
    // Fallback
    return [];
};

export const getPolygonHatchPath = (polygon, center, angle, gap) => {
    // 1. Rotate polygon with the provided angle
    const edges = rotateLines(polygon, center, angle).map(edge => {
        return edge.sort((a, b) => - b[1] + a[1]);
    });
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

export const getEllipseHatchPath = (width, height, center, angle, gap) => {
    const a = width / 2;
    const b = height / 2;
    const rectanglePath = getPolygonPath(POLYGON.RECTANGLE, width, height);
    return getPolygonHatchPath(rectanglePath, center, angle, gap)
        .map(line => {
            const c = (line[1][0] - line[0][0]) / (line[1][1] - line[0][1]);
            const d = line[0][0] - c * line[0][1];
            const e = a*a*b*b - (center[0]*center[0]*b*b) - (center[1]*center[1]*a*a);
            const f = b*b*c*c + a*a;
            const g = 2*c*d*b*b - 2*center[0]*b*b*c - 2*center[1]*a*a;
            const h = d*d*b*b - 2*center[0]*b*b*d - e;
            const sqrt = g*g - 4*f*h;
            if (sqrt < 0) {
                return null;
            }
            const y1 = (-g + Math.sqrt(sqrt)) / (2*f);
            const y2 = (-g - Math.sqrt(sqrt)) / (2*f);
            return [[c*y1 + d, y1], [c*y2 + d, y2]];
        })
        .filter(line => !!line);
};

// Generate a rectangle path from the given points
export const getRectanglePath = p => {
    return `M${p[0][0]},${p[0][1]} L${p[1][0]},${p[1][1]} L${p[2][0]},${p[2][1]} L${p[3][0]},${p[3][1]} Z`;
};

// Get curve path
export const getCurvePath = (points, controlPoint = null) => {
    if (points.length === 2) {
        // Check for a simple line
        if (!controlPoint) {
            return `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]}`;
        }
        // Generate curve using the three points
        return `M${points[0][0]},${points[0][1]} Q${controlPoint[0]},${controlPoint[1]} ${points[1][0]},${points[1][1]}`;
    }
    // TODO
    return "";
};
