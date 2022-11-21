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

// Clean SVG using el.cloneNode
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode 
const exportSvg = (svg, width, height) => {
    // 1. Create a new SVG element
    const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // 2. Set new svg attributes
    // newSvg.setAttribute("style", ""); // Reset style
    newSvg.setAttribute("width", width + "px");
    newSvg.setAttribute("height", height + "px");

    // 3. Append elements into new SVG
    Array.from(svg.querySelectorAll("g[data-element-id")).forEach(element => {
        newSvg.appendChild(element.cloneNode(true));
    });

    // 4. return new SVG
    return newSvg;
};

// Export Folio SVG object to PNG
export const toImagePNG = (svg, width, height, options) => {
    const DOMURL = window?.URL || window?.webkitURL || window;
    return new Promise((resolve, reject) => {
        const clonedSvg = exportSvg(svg, width, height, options);
        const svgString = (new XMLSerializer()).serializeToString(clonedSvg);
        const svgBlob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
        });

        // Initialize canvas to render SVG image
        const canvas = document.createElement("canvas");
        canvas.width = options?.region?.width || width;
        canvas.height = options?.region?.height || height;

        // Initialize image
        const img = new Image();
        img.addEventListener("load", () => {
            const x = (-1) * (options?.region?.x || 0);
            const y = (-1) * (options?.region?.y || 0);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, x, y);
            // return resolve(canvas.toDataURL("image/png"));
            canvas.toBlob(resolve);
        });
        img.addEventListener("error", event => {
            return reject(event);
        });

        // Load image
        img.src = DOMURL.createObjectURL(svgBlob);
    });
};
