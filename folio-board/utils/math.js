// Calculate the distance between two points
export const getPointsDistance = (start, end) => {
    const x = end[0] - start[0];
    const y = end[1] - start[1];
    return Math.sqrt(x * x + y * y);
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
export const measureText = (text, textSize, textFont) => {
    let width = 0, height = 0;
    if (text.length > 0) {
        if (!measureText.container) {
            measureText.container = document.createElement("pre");
            measureText.container.style.position = "absolute";
            measureText.container.style.visibility = "hidden";
            measureText.container.style.top = "-9999px";
            measureText.container.style.left = "-9999px";
            measureText.container.style.lineHeight = "normal"; // Set line-height as normal
            measureText.container.style.whiteSpace = "pre";
            measureText.container.style.minHeight = "1em";
            document.body.appendChild(measureText.container);
        }
        // .replace(/\r\n?/g, "\n"); // .split("\n").join("<br>");
        measureText.container.innerHTML = text.charAt(text.length - 1) === "\n" ? text + " " : text;
        measureText.container.style.fontFamily = textFont;
        measureText.container.style.fontSize = textSize + "px";
        width = measureText.container.offsetWidth; // Set computed width
        height = measureText.container.offsetHeight; // Set computed height
        // document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return [width, height];
};
