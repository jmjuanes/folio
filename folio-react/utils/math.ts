export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;

export type Point = [ x: number, y: number ];
export type Segment = [ start: Point, end: Point ];
export type Line = Segment;

// internal variable to sotre the PRE element used to measure text
const measureTextElement = {
    current: null as HTMLPreElement | null,
};

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

// @description Computes the intersection point of two infinite lines, each defined by two points.
// @param {{x:number, y:number}} A First point of line 1
// @param {{x:number, y:number}} B Second point of line 1
// @param {{x:number, y:number}} C First point of line 2
// @param {{x:number, y:number}} D Second point of line 2
// @returns {{x:number, y:number}|null}
export const getIntersectionPoint = (line1: Segment, line2: Segment): Point | null => {
    // 1. calculate the determinant of the system
    const denom = (line1[0][0] - line1[1][0]) * (line2[0][1] - line2[1][1]) - (line1[0][1] - line1[1][1]) * (line2[0][0] - line2[1][0]);
    if (denom === 0) {
        // lines are parallel or coincident
        return null;
    }

    // 2. calculate the determinants for each line
    const det1 = line1[0][0] * line1[1][1] - line1[0][1] * line1[1][0];
    const det2 = line2[0][0] * line2[1][1] - line2[0][1] * line2[1][0];

    // 4. apply Cramer's rule to find intersection point
    return [
        (det1 * (line2[0][0] - line2[1][0]) - (line1[0][0] - line1[1][0]) * det2) / denom,
        (det1 * (line2[0][1] - line2[1][1]) - (line1[0][1] - line1[1][1]) * det2) / denom,
    ];
};

// get a point in a quadratig curve
export const getPointInQuadraticCurve = (p1: Point, p2: Point, p3: Point, t: number = 0.5): Point => {
    return [
        (p1[0] * (1 - t) * (1 - t)) + (p2[0] * 2 * t * (1 - t)) + (p3[0] * t * t),
        (p1[1] * (1 - t) * (1 - t)) + (p2[1] * 2 * t * (1 - t)) + (p3[1] * t * t),
    ];
};

// Calculate the perimeter of an ellipse using Ramanujan approximation
export const getEllipsePerimeter = (rx: number, ry: number): number => {
    const lambda = Math.pow((rx - ry) / (rx + ry), 2);
    return Math.PI * (rx + ry) * (1 + (3 * lambda) / (10 + Math.sqrt(4 - 3 * lambda)));
};

// Calculate the perimeter of a circle
export const getCirclePerimeter = (radius: number): number => {
    return 2 * Math.PI * radius;
};

// Calculate the perimeter of a rectangle
export const getRectanglePerimeter = (width: number, height: number): number => {
    return 2 * (width + height);
};

// Calculate the perimeter of a rounded rectangle
export const getRoundedRectanglePerimeter = (width: number, height: number, radius: number = 0): number => {
    return getRectanglePerimeter(width, height) - (2 * radius) + getCirclePerimeter(radius);
};

// @description get the rectangle defined by two points
export const getRectangle = (p1: Point, p2: Point, angle: number = 0): Point[] => {
    if (!angle || angle === 0) {
        return [p1, [ p2[0], p1[1] ], p2, [ p1[0], p2[1] ]];
    }
    // calcualte the center and rotate back the points to its original position
    const center = getCenter(p1, p2);
    const originalPoints = rotatePoints([p1, p2], center, -angle);
    const newPoints: Point[] = [
        [ originalPoints[1][0], originalPoints[0][1] ],
        [ originalPoints[0][0], originalPoints[1][1] ],
    ];
    // rotate the new points to generate the other rectangle vertex points
    const [ p3, p4 ] = rotatePoints(newPoints, center, angle);
    return [ p1, p3, p2, p4 ];
};

// Generate the minumun rectangle points that contains all points in the provided list
export const getBoundingRectangle = (points: Point[]): Point[] => ([
    [ Math.min.apply(null, points.map(p => p[0])), Math.min.apply(null, points.map(p => p[1])) ],
    [ Math.max.apply(null, points.map(p => p[0])), Math.max.apply(null, points.map(p => p[1])) ],
]);

// Generate a balanced dash line
// Adapted from https://gist.github.com/steveruizok/7b30a30f915362f219d0516073f92d69 
export const getBalancedDash = (length: number = 0, strokeWidth: number = 0, style: string = "dashed"): [string, string] => {
    let strokeDasharray: string = "none";
    let strokeDashoffset: string = "none";
    if (strokeWidth > 0 && length > 0) {
        if (style === "dotted" || style === "dashed") {
            const ratio = style === "dotted" ? 100 : 1;
            const dashLength = style === "dotted" ? strokeWidth / 100 : strokeWidth * 2;
            const dashes = Math.floor(length / dashLength / (2 * ratio));
            const gapLength = Math.max(dashLength, (length - dashes * dashLength) / dashes);

            strokeDasharray = [dashLength, gapLength].join(" ");
            strokeDashoffset = style === "dotted" ? "0" : "" + (dashLength / 2);
        }
    }
    return [strokeDasharray, strokeDashoffset];
};

// Measure text size
export const measureText = (text: string, textSize: string | number, textFont: string, maxWidth: string): number[] => {
    let width = 0, height = 0;
    if (text.length > 0) {
        if (!measureTextElement.current) {
            measureTextElement.current = document.createElement("pre") as HTMLPreElement;
            measureTextElement.current.style.position = "absolute";
            measureTextElement.current.style.visibility = "hidden";
            measureTextElement.current.style.top = "-9999px";
            measureTextElement.current.style.left = "-9999px";
            measureTextElement.current.style.lineHeight = "normal"; // Set line-height as normal
            measureTextElement.current.style.whiteSpace = "pre-wrap";
            // measureText.container.style.wordBreak = "keep-all";
            measureTextElement.current.style.overflowWrap = "break-word";
            measureTextElement.current.style.minHeight = "1em";
            measureTextElement.current.style.minWidth = "1em";
            measureTextElement.current.style.margin = "0";
            measureTextElement.current.style.padding = "0";
            document.body.appendChild(measureTextElement.current);
        }
        // .replace(/\r\n?/g, "\n"); // .split("\n").join("<br>");
        measureTextElement.current.textContent = text.charAt(text.length - 1) === "\n" ? text + " " : text;
        measureTextElement.current.style.fontFamily = textFont;
        measureTextElement.current.style.fontSize = textSize + "px";
        measureTextElement.current.style.maxWidth = maxWidth ?? "auto";
        width = measureTextElement.current.offsetWidth; // Set computed width
        height = measureTextElement.current.offsetHeight; // Set computed height
    }
    // return the text size
    return [ width, height ];
};

// Canculate the distance from the point p to the segment [p1, p2]
export const distanceToSegment = (p: Point, p1: Point, p2: Point): number => {
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
export const simplifyPath = (points: Point[], tolerance: number): Point[] => {
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

// @description rotate the x coordinate
export const rotateX = (x: number, y: number, center: Point, angle: number): number => {
    return ((x - center[0]) * Math.cos(angle)) - ((y - center[1]) * Math.sin(angle)) + center[0];
};

// @description rotate the y coordinate
export const rotateY = (x: number, y: number, center: Point, angle: number): number => {
    return ((x - center[0]) * Math.sin(angle)) + ((y - center[1]) * Math.cos(angle)) + center[1];
};

// Rotate the provided points list
export const rotatePoints = (points: Point[], center: Point, angle: number): Point[]=> {
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
        return rotatePoints(points, center, angle) as Segment;
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

// @description convert degrees to radians
export const convertDegreesToRadians = (degrees = 0) => {
    return (degrees * Math.PI) / 180;
};
