// Get real sign of the provided number
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign 
// Fixes sign(0) = +1 instead of Math.sign(0) = 0
export const sign = n => n < 0 ? -1 : +1;

// Get absolute positions
export const getAbsolutePositions = (position, size) => {
    return [
        Math.min(position, position + size),
        Math.max(position, position + size)
    ];
};

// Normalize the specified region
export const normalizeRegion = region => {
    const [xStart, xEnd] = getAbsolutePositions(region.x, region.width);
    const [yStart, yEnd] = getAbsolutePositions(region.y, region.height);
    return {
        x: xStart,
        width: xEnd - xStart,
        y: yStart,
        height: yEnd - yStart,
    };
};

// Generate the outer rectangle that includes all items in the list
export const getOuterRectangle = items => {
    let xStart = Infinity, yStart = Infinity, xEnd = 0, yEnd = 0;
    items.forEach(item => {
        const [x0, x1] = getAbsolutePositions(item.x, item.width);
        const [y0, y1] = getAbsolutePositions(item.y, item.height);
        xStart = Math.min(x0, xStart);
        xEnd = Math.max(x1, xEnd);
        yStart = Math.min(y0, yStart);
        yEnd = Math.max(y1, yEnd);
    });
    return {
        x: xStart,
        y: yStart,
        width: Math.abs(xEnd - xStart),
        height: Math.abs(yEnd - yStart),
    };
};

// Calculate the center point of a segment
export const centerOfSegment = (p1, p2) => ([
    p1[0] + (p2[0] - p1[0]) / 2,
    p1[1] + (p2[1] - p1[1]) / 2,
]);

// Canculate the distance from the point p to the segment [p1, p2]
export const distanceToSegment = (p, p1, p2) => {
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

// Path simplification based on the Ramer–Douglas–Peucker algorithm
export const simplifyPath = (points, tolerance) => {
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
