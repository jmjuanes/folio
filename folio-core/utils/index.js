// Generate the minumun rectangle points that contains all points in the provided list
export const boundaryPoints = points => {
    const x = points.map(point => point[0]);
    const y = points.map(point => point[1]);
    const minX = Math.min.apply(null, x);
    const minY = Math.min.apply(null, y);
    const maxX = Math.max.apply(null, x);
    const maxY = Math.max.apply(null, y);
    return [
        [minX, minY],
        [minX, maxY],
        [maxX, maxY],
        [maxX, minY],
    ];
};

// Normalize a rectangle
// @param rectangle: rectangle object
export const normalizeRectangle = rectangle => ({
    x: Math.min(rectangle.x, rectangle.x + rectangle.width),
    y: Math.min(rectangle.y, rectangle.y + rectangle.height),
    width: Math.abs(rectangle.width),
    height: Math.abs(rectangle.height),
});

// Check if a point is inside a rectangle
// NOTE: rectangle must be normalized!
export const pointInRectangle = (p, r) => {
    return !(p[0] < r.x || r.x + r.width < p[0] || p[1] < r.y || r.y + r.height < p[1]);
};

// Generate a balanced dash line
// Adapted from https://gist.github.com/steveruizok/7b30a30f915362f219d0516073f92d69 
export const getBalancedDash = (length = 0, strokeWidth = 0, style = "dashed") => {
    const ratio = style === "dotted" ? 100 : 1;
    const dashLength = style === "dotted" ? strokeWidth / 100 : strokeWidth * 2;
    const dashes = Math.floor(length / dashLength / (2 * ratio));
    const gapLength = Math.max(dashLength, (length - dashes * dashLength) / dashes);

    return {
        strokeDasharray: [dashLength, gapLength].join(" "),
        strokeDashoffset: style === "dotted" ? "0" : dashLength / 2,
    };
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

