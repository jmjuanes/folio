export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;

export type Point = [x: number, y: number];
export type Segment = [start: Point, end: Point];
export type Line = Segment;

//@description returns the sign of the provided value
export const sign = (value: number): number => {
    return value < 0 ? -1 : +1;
};

// @description calculate the hipotenuse
export const hypotenuse = (x: number, y: number): number => {
    return Math.sqrt(x * x + y * y);
};

// @description calculate the distance between the provided list of points
export const getPointsDistance = (...points: Point[]): number => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
        const x = points[i][0] - points[i-1][0];
        const y = points[i][1] - points[i-1][1];
        length = length + hypotenuse(x, y);
    }
    return length;
};

// @description calculate the center between two points
export const getCenter = (p1: Point, p2: Point): Point => {
    return [
        (p2[0] + p1[0]) / 2,
        (p2[1] + p1[1]) / 2,
    ];
};

// @description calculate the distance of a point to a line
export const getPointDistanceToLine = (point: Point, line: Segment): number => {
    const x = line[1][0] - line[0][0];
    const y = line[1][1] - line[0][1];
    const a = (point[0] * y) - (point[1] * x) + (line[1][0] * line[0][1]) - (line[1][1] * line[0][0]);
    return Math.abs(a) / hypotenuse(y, x);    
};

// @description get the projection of a point to a line
export const getPointProjectionToLine = (point: Point, line: Segment): Point => {
    const ax = line[1][0] - line[0][0], ay = line[1][1] - line[0][1];
    const bx = point[0] - line[0][0], by = point[1] - line[0][1];
    const p = ((ax * bx) + (ay * by)) / ((ax * ax) + (ay * ay));
    return [
        line[0][0] + p * ax,
        line[0][1] + p * ay,
    ];
};

// get a point in a quadratig curve
export const getPointInQuadraticCurve = (p1, p2, p3, t = 0.5) => {
    // const t = 0.5; // (p1[0] - p2[0]) / (p1[0] + p3[0] - 2 * p2[0]);
    const x = (p1[0] * (1 - t) * (1 - t)) + (p2[0] * 2 * t * (1 - t)) + (p3[0] * t * t);
    const y = (p1[1] * (1 - t) * (1 - t)) + (p2[1] * 2 * t * (1 - t)) + (p3[1] * t * t);
    return [x, y];
};

// Calculate the perimeter of an ellipse using Ramanujan approximation
export const getEllipsePerimeter = (rx, ry) => {
    const lambda = Math.pow((rx - ry) / (rx + ry), 2);
    return Math.PI * (rx + ry) * (1 + (3 * lambda) / (10 + Math.sqrt(4 - 3 * lambda)));
};

// Calculate the perimeter of a circle
export const getCirclePerimeter = radius => {
    return 2 * Math.PI * radius;
};

// Calculate the perimeter of a rectangle
export const getRectanglePerimeter = (width, height) => {
    return 2 * (width + height);
};

// Calculate the perimeter of a rounded rectangle
export const getRoundedRectanglePerimeter = (width, height, radius = 0) => {
    return getRectanglePerimeter(width, height) - (2 * radius) + getCirclePerimeter(radius);
};

// Generate the minumun rectangle points that contains all points in the provided list
export const getRectangleBounds = bounds => ({
    x1: Math.min.apply(null, bounds.map(b => Math.min(b.x1, b.x2))),
    x2: Math.max.apply(null, bounds.map(b => Math.max(b.x1, b.x2))),
    y1: Math.min.apply(null, bounds.map(b => Math.min(b.y1, b.y2))),
    y2: Math.max.apply(null, bounds.map(b => Math.max(b.y1, b.y2))),
});

// get bounds containing the provided points
export const getPointsBounds = points => ({
    x1: Math.min.apply(null, points.map(p => p[0])),
    x2: Math.max.apply(null, points.map(p => p[0])),
    y1: Math.min.apply(null, points.map(p => p[1])),
    y2: Math.max.apply(null, points.map(p => p[1])),
});

// Normalize bounds
// @param bounds: a bounds object containing the coordinates x1,y1 and x2,y2
export const normalizeBounds = bounds => ({
    x1: Math.min(bounds.x1, bounds.x2),
    x2: Math.max(bounds.x1, bounds.x2),
    y1: Math.min(bounds.y1, bounds.y2),
    y2: Math.max(bounds.y1, bounds.y2),
});

// Generate a balanced dash line
// Adapted from https://gist.github.com/steveruizok/7b30a30f915362f219d0516073f92d69 
export const getBalancedDash = (length = 0, strokeWidth = 0, style = "dashed") => {
    let strokeDasharray = "none";
    let strokeDashoffset = "none";
    if (strokeWidth > 0 && length > 0) {
        if (style === "dotted" || style === "dashed") {
            const ratio = style === "dotted" ? 100 : 1;
            const dashLength = style === "dotted" ? strokeWidth / 100 : strokeWidth * 2;
            const dashes = Math.floor(length / dashLength / (2 * ratio));
            const gapLength = Math.max(dashLength, (length - dashes * dashLength) / dashes);

            strokeDasharray = [dashLength, gapLength].join(" ");
            strokeDashoffset = style === "dotted" ? 0 : dashLength / 2;
        }
    }
    return [strokeDasharray, strokeDashoffset];
};

// Measure text size
export const measureText = (text, textSize, textFont, maxWidth) => {
    let width = 0, height = 0;
    if (text.length > 0) {
        if (!measureText.container) {
            measureText.container = document.createElement("pre");
            measureText.container.style.position = "absolute";
            measureText.container.style.visibility = "hidden";
            measureText.container.style.top = "-9999px";
            measureText.container.style.left = "-9999px";
            measureText.container.style.lineHeight = "normal"; // Set line-height as normal
            measureText.container.style.whiteSpace = "pre-wrap";
            // measureText.container.style.wordBreak = "keep-all";
            measureText.container.style.overflowWrap = "break-word";
            measureText.container.style.minHeight = "1em";
            measureText.container.style.minWidth = "1em";
            measureText.container.style.margin = "0";
            measureText.container.style.padding = "0";
            document.body.appendChild(measureText.container);
        }
        // .replace(/\r\n?/g, "\n"); // .split("\n").join("<br>");
        measureText.container.textContent = text.charAt(text.length - 1) === "\n" ? text + " " : text;
        measureText.container.style.fontFamily = textFont;
        measureText.container.style.fontSize = textSize + "px";
        measureText.container.style.maxWidth = maxWidth ?? "auto";
        width = measureText.container.offsetWidth; // Set computed width
        height = measureText.container.offsetHeight; // Set computed height
        // document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return [width, height];
};

// Canculate the distance from the point p to the segment [p1, p2]
export const distanceToSegment = (p: Point, p1: Point, p2: Point) => {
    const m = (p2[1]- p1[1]) / (p2[0] - p1[0]);
    const b = p1[1] - m * p1[0];
    const d = [
        // Distance to the linear equation
        Math.abs(p[1] - m * p[0] - b) / Math.sqrt(Math.pow(m, 2) + 1),
        // Distance to p1
        Math.sqrt(Math.pow(p[0] - p1[0], 2) + Math.pow(p[1] - p1[1], 2)),
        // Distance to p2
        Math.sqrt(Math.pow(p[0] - p2[0], 2) + Math.pow(p[1] - p2[1], 2)),
    ];
    // Return the smallest distance
    return Math.min.apply(null, d);
};

// Path simplification based on the Ramer-Douglas-Peucker algorithm
export const simplifyPath = (points: Points[], tolerance: number): Points[] => {
    if (points.length <= 2) {
        return points;
    }
    let maxDistance = -1;
    let maxDistanceIndex = 0;
    for (let i = 1; i < points.length - 1; i++) {
        const distance = distanceToSegment(points[i], points[0], points[points.length - 1]);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxDistanceIndex = i;
        }
    }
    if (maxDistance > tolerance) {
        return [
            ...simplifyPath(points.slice(0, maxDistanceIndex + 1), tolerance),
            ...simplifyPath(points.slice(maxDistanceIndex), tolerance).slice(1),
        ];
    }
    return [
        points[0],
        points[points.length - 1],
    ];
};

// Rotate the provided points list
export const rotatePoints = (points: Points[], center: Point, angle: number): Points[]=> {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return (points || []).map(point => {
        return [
            ((point[0] - center[0]) * cos) - ((point[1] - center[1]) * sin) + center[0],
            ((point[0] - center[0]) * sin) + ((point[1] - center[1]) * cos) + center[1],
        ];
    });
};
  
// Rotate the provided lines list
export const rotateLines = (lines: Segment[], center: Point, angle: number): Segment[] => {
    return (lines || []).map(points => {
        return rotatePoints(points, center, angle);
    });
};

// Snap angle to 15 degree increments
export const snapAngle = (angle = 0, snapIncrement = Math.PI / 12) => {
    return Math.round(angle / snapIncrement) * snapIncrement;
};

// Clamp angle between 0 and 2*PI
export const clampAngle = (angle = 0) => {
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
};

// @description convert radians to degrees
export const convertRadiansToDegrees = (radians = 0) => {
    return (radians * 180) / Math.PI;
};
