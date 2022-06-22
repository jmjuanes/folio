import {
    KEYS,
    INTERACTION_MODES,
    TEXT_ALIGNS,
    TEXT_VERTICAL_ALIGNS,
    LINE_CAPS,
    ELEMENT_TYPES,
    ELEMENT_CHANGE_TYPES,
    RESIZE_TYPES,
    RESIZE_ORIENTATIONS,
} from "./constants.js";

// Inverse resize orientations
const inverseResizeOrientations = {
    [RESIZE_ORIENTATIONS.LEFT_TOP]: [RESIZE_ORIENTATIONS.RIGHT_BOTTOM, RESIZE_ORIENTATIONS.RIGHT_TOP, RESIZE_ORIENTATIONS.LEFT_BOTTOM],
    [RESIZE_ORIENTATIONS.LEFT_BOTTOM]: [RESIZE_ORIENTATIONS.RIGHT_TOP, RESIZE_ORIENTATIONS.RIGHT_BOTTOM, RESIZE_ORIENTATIONS.LEFT_TOP],
    [RESIZE_ORIENTATIONS.RIGHT_TOP]: [RESIZE_ORIENTATIONS.LEFT_BOTTOM, RESIZE_ORIENTATIONS.LEFT_TOP, RESIZE_ORIENTATIONS.RIGHT_BOTTOM],
    [RESIZE_ORIENTATIONS.RIGHT_BOTTOM]: [RESIZE_ORIENTATIONS.LEFT_TOP, RESIZE_ORIENTATIONS.LEFT_BOTTOM, RESIZE_ORIENTATIONS.RIGHT_TOP],
    [RESIZE_ORIENTATIONS.LEFT]: [RESIZE_ORIENTATIONS.RIGHT, RESIZE_ORIENTATIONS.RIGHT, RESIZE_ORIENTATIONS.LEFT],
    [RESIZE_ORIENTATIONS.RIGHT]: [RESIZE_ORIENTATIONS.LEFT, RESIZE_ORIENTATIONS.LEFT, RESIZE_ORIENTATIONS.RIGHT],
    [RESIZE_ORIENTATIONS.TOP]: [RESIZE_ORIENTATIONS.BOTTOM, RESIZE_ORIENTATIONS.TOP, RESIZE_ORIENTATIONS.BOTTOM],
    [RESIZE_ORIENTATIONS.BOTTOM]: [RESIZE_ORIENTATIONS.TOP, RESIZE_ORIENTATIONS.BOTTOM, RESIZE_ORIENTATIONS.TOP],
};

const uid = () => Date.now() + "";

// Color parser
export const parseColor = (color, opacity) => {
    if (color === "transparent") {
        return color; // Nothing to do if color is transparent
    }
    // Get RGB values from color and return the RGBA color
    return `rgba(${color.match(/\d+/g).slice(0, 3).join(",")},${opacity})`;
};

// Convert a data to blob
// Idea from https://stackoverflow.com/a/19328891
const toBlob = (content, type) => {
    return new Blob([content], {
        type: type,
    });
};

// Convert DataURL to blob
// https://stackoverflow.com/a/30407959
const dataUrlToBlob = data => {
    const list = data.split(",");
    const bstr = atob(list[1]);
    const size = bstr.length;
    const u8list = new Uint8Array(size);
    while (n > 0) {
        u8list[n-1] = bstr.charCodeAt(n-1);
        n = n - 1;
    }
    return new Blob([u8list], {
        "type": list[0].match(/:(.*?);/)[1], // Extract mime type
    });
};

// Convert Blob to DataURL
const blobToDataUrl = blob => {
    return new Promise(resolve => {
        const file = new FileReader();
        file.onload = event => {
            return resolve(event.target.result);
        };
        return file.readAsDataURL(blob);
    });
};

// Get pasted items
const getDataFromClipboard = event => {
    return new Promise(resolve => {
        const items = event?.clipboardData?.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; // Get current item
            if (item.type.indexOf("image") !== -1) {
                return resolve({type: "image", blob: item.getAsFile()});
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(content => {
                    return resolve({type: "text", blob: content});
                });
            }
        }
    });
};

// Parse clipboard data
const parseClipboardBlob = (type, blob) => {
    if (type === "text") {
        return Promise.resolve(blob.trim());
    }
    // Convert blob to dataURL
    return blobToDataUrl(blob);
};

// For each reversed
const forEachRev = (list, callback) => {
    for (let i = list.length - 1; i >= 0; i--) {
        callback(list[i], i); // Call this element
    }
};

// Get absolute positions
const getAbsolutePositions = (position, size) => {
    return [
        Math.min(position, position + size),
        Math.max(position, position + size)
    ];
};

// Measure text size
const measureText = (text, textSize, textFont) => {
    const size = {width: 0, height: 0}; // To store the computed text size
    if (text.length > 0) {
        if (!measureText.div) {
            measureText.div = document.createElement("div");
            measureText.div.style.position = "absolute";
            measureText.div.style.visibility = "hidden";
            measureText.div.style.top = "-9999px";
            measureText.div.style.left = "-9999px";
            measureText.div.style.lineHeight = "normal"; // Set line-height as normal
            measureText.div.style.whiteSpace = "pre";
            document.body.appendChild(measureText.div);
        }
        measureText.div.innerHTML = text.replace(/\r\n?/g, "\n").split("\n").join("<br>");
        measureText.div.style.fontFamily = textFont;
        measureText.div.style.fontSize = textSize + "px";
        size.width = measureText.div.offsetWidth; // Set computed width
        size.height = measureText.div.offsetHeight; // Set computed height
        // document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return size;
};

// Create a temporal canvas element
const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

// Create an image element
// https://stackoverflow.com/a/4776378
const createImage = content => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = content; // Set image source
    });
};

// Generate a screenshot of the provided canvas and the specified region
// https://stackoverflow.com/a/13074780
const screenshot = (originalCanvas, region) => {
    return new Promise(resolve => {
        if (!region) {
            return originalCanvas.toBlob(blob => resolve(blob));
        }
        // Get screenshot
        const originalContext = originalCanvas.getContext("2d");
        const image = originalContext.getImageData(region.x || 0, region.y || 0, region.width, region.height);
    
        // Create a new canvas to draw the screenshot
        const canvas = createCanvas(region.width, region.height); // New canvas
        const context = canvas.getContext("2d");
        context.putImageData(image, 0, 0);

        return canvas.toBlob(blob => resolve(blob));
    });
};

// Check for arrow keys
const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// Check if the provided event.target is related to an input element
const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

// Create a snapshot of the selection
const snapshotSelection = selection => {
    return selection.map(element => ({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
    }));
};

const getResizePoints = (element, offset) => {
    const [x0, x1] = getAbsolutePositions(element.x, element.width);
    const [y0, y1] = getAbsolutePositions(element.y, element.height);
    if (element.resize === RESIZE_TYPES.ALL) {
        return [
            {orientation: RESIZE_ORIENTATIONS.LEFT_TOP, x: x0 - offset, y: y0 - offset, xs: -1, ys: -1},
            {orientation: RESIZE_ORIENTATIONS.TOP, x: (x0 + x1) / 2, y: y0 - offset, xs: -0.5, ys: -1},
            {orientation: RESIZE_ORIENTATIONS.RIGHT_TOP, x: x1 + offset, y: y0 - offset, xs: 0, ys: -1},
            {orientation: RESIZE_ORIENTATIONS.LEFT, x: x0 - offset, y: (y0 + y1) / 2, xs: -1, ys: -0.5},
            {orientation: RESIZE_ORIENTATIONS.RIGHT, x: x1 + offset, y: (y0 + y1) / 2, xs: 0, ys: -0.5},
            {orientation: RESIZE_ORIENTATIONS.LEFT_BOTTOM, x: x0 - offset, y: y1 + offset, xs: -1, ys: 0},
            {orientation: RESIZE_ORIENTATIONS.RIGHT_BOTTOM, x: x1 + offset, y: y1 + offset, xs: 0, ys: 0},
            {orientation: RESIZE_ORIENTATIONS.BOTTOM, x: (x0 + x1) / 2, y: y1 + offset, xs: -0.5, ys: 0},
        ];
    }
    else if (element.resize === RESIZE_TYPES.MAIN_DIAGONAL) {
        return [
            {orientation: RESIZE_ORIENTATIONS.LEFT_TOP, x: x0 - offset, y: y0 - offset, xs: -1, ys: -1},
            {orientation: RESIZE_ORIENTATIONS.RIGHT_BOTTOM, x: x1 + offset, y: y1 + offset, xs: 0, ys: 0},
        ];
    }
    // Default: no resize points
    return [];
};

// Check if the cursor is inside a resize point
const inResizePoint = (element, x, y, size, offset) => {
    return getResizePoints(element, offset).find(point => {
        const px = point.x + point.xs * size;
        const py = point.y + point.ys * size;
        return px <= x && x <= px + size && py <= y && y <= py + size;
    });
};

// Fix resize orientation
const fixResizeOrientation = (element, orientation) => {
    if (element.width < 0 && element.height < 0) {
        return inverseResizeOrientations[orientation][0];
    } else if (element.width < 0) {
        return inverseResizeOrientations[orientation][1];
    } else if (element.height < 0) {
        return inverseResizeOrientations[orientation][2];
    }
    return orientation;
};

// Draw a simple rectangle
const drawSimpleRectangle = (ctx, element) => {
    ctx.globalAlpha = element.opacity;
    ctx.beginPath();
    ctx.fillStyle = element.color;
    ctx.rect(element.x, element.y, element.width, element.height);
    ctx.fill();
    ctx.globalAlpha = 1;
};

// Render element inner text
const drawInnerText = (canvas, element) => {
    if (element.textContent.length === 0 || element.textColor === "transparent") {
        return null; // Nothing to render
    }
    canvas.beginPath();
    canvas.font = `${element.textSize}px ${element.textFont}`;
    canvas.fillStyle = parseColor(element.textColor, element.textOpacity);
    canvas.textAlign = TEXT_ALIGNS.CENTER; //Center text in the rectangle
    canvas.textBaseline = "middle"; //Center text in the line position
    const lines = element.textContent.replace(/\r\n?/g, "\n").split("\n");
    const lineHeight = element.textSize; //element.height / lines.length;
    const x = element.x + element.width / 2; //Text x position
    const y = element.y + (element.height - lineHeight * lines.length) / 2; 
    // let offset = element.height - element.baseline;
    for (let i = 0; i < lines.length; i++) {
        canvas.fillText(lines[i], x, y + i * lineHeight + lineHeight / 2);
    }
};

// Draw a glyph
const drawGlyph = (canvas, type, position, element, length) => {
    const size = element.strokeWidth * 2 + 4;
    if (length < size) {
        return null; // Unable to draw the element
    }
    const x = (position === "start") ? element.x : element.x + element.width; //x coordinate
    const y = (position === "start") ? element.y : element.y + element.height; //y coordinate
    const sign = (position === "start") ? +1 : -1;
    const dx = element.width; // - element.x;
    const dy = element.height; // - element.y;
    const angle = Math.atan2(dy, dx); // Arrow line angle
    // Initialize the path
    canvas.beginPath();
    canvas.setLineDash([]); // Clear line-dash style
    // Check for arrow element
    if (type === LINE_CAPS.ARROW) {
        const angle2 = Math.PI / 8;
        const hip = size * 4 / 3;
        canvas.moveTo(x, y);
        canvas.lineTo(x + sign * hip * Math.cos(angle - angle2), y - sign * hip * Math.sin(angle2 - angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle2 + angle), y + sign * hip * Math.sin(angle2 + angle));
    }
    // Check for square element
    else if (type === LINE_CAPS.SQUARE) {
        const angle2 = Math.atan(0.5); // Second angle for the rectangle
        const hsize = size / 2; // Half of the size
        const hip = Math.sqrt(size * size + hsize * hsize);
        canvas.moveTo(x, y);
        canvas.lineTo(x + sign * hsize * Math.sin(angle), y - sign * hsize * Math.cos(angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle - angle2), y - sign * hip * Math.sin(angle2 - angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle + angle2), y + sign * hip * Math.sin(angle2 + angle));
        canvas.lineTo(x - sign * hsize * Math.sin(angle), y + sign * hsize * Math.cos(angle));
    }
    // Check for circle
    else if (type === LINE_CAPS.CIRCLE) {
        const hsize = size / 2; // Half of the size
        const cx = x + sign * hsize * Math.cos(angle);
        const cy = y + sign * hsize * Math.sin(angle);
        canvas.arc(cx, cy, hsize, 0, 2 * Math.PI);
    }
    // Fill the glyph
    canvas.closePath();
    canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
    canvas.stroke();
    canvas.fillStyle = parseColor(element.strokeColor, element.strokeOpacity);
    // canvas.fillStyle = element.strokeColor;
    canvas.fill();
};

const elements = {
    [ELEMENT_TYPES.SELECTION]: {
        init: options => ({
            resize: RESIZE_TYPES.NONE,
            color: options.selectionColor,
            opacity: options.selectionOpacity,
        }),
        draw: (ctx, element) => drawSimpleRectangle(ctx, element),
        update: () => null,
    },
    [ELEMENT_TYPES.SCREENSHOT]: {
        init: options => ({
            resize: RESIZE_TYPES.NONE,
            color: options.screenshotColor,
            opacity: options.screenshotOpacity,
        }),
        draw: (ctx, element) => drawSimpleRectangle(ctx, element),
        update: () => null,
    },
    [ELEMENT_TYPES.SHAPE_RECTANGLE]: {
        init: options => ({
            resize: RESIZE_TYPES.ALL,
            fillColor: options.fillColor,
            fillOpacity: 1.0,
            strokeColor: options.strokeColor, // colors.black,
            strokeWidth: 1,
            strokeDash: false,
            strokeOpacity: 1.0,
            radius: 0,
            textAlign: "center",
            textVerticalAlign: "middle",
            textColor: options.textColor, // colors.black,
            textFont: options.fontFamily, // "sans-serif",
            textOpacity: 1.0,
            textSize: 16,
            textContent: "",
        }),
        draw: (canvas, element, shouldDrawInnerText) => {
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            const halfWidth = Math.abs(element.width) / 2;
            const halfHeight = Math.abs(element.height) / 2;
            const radius = Math.min(element.radius, halfWidth, halfHeight);
            // canvas.restore();
            canvas.beginPath();
            // canvas.globalAlpha = element.opacity;
            // canvas.rect(element.x, element.y, element.width, element.height);
            canvas.moveTo(xStart + radius, yStart);
            canvas.lineTo(xEnd - radius, yStart);
            canvas.quadraticCurveTo(xEnd, yStart, xEnd, yStart + radius);
            canvas.lineTo(xEnd, yEnd - radius);
            canvas.quadraticCurveTo(xEnd, yEnd, xEnd - radius, yEnd);
            canvas.lineTo(xStart + radius, yEnd);
            canvas.quadraticCurveTo(xStart, yEnd, xStart, yEnd - radius);
            canvas.lineTo(xStart, yStart + radius);
            canvas.quadraticCurveTo(xStart, yStart, xStart + radius, yStart);
            canvas.closePath();
            canvas.fillStyle = parseColor(element.fillColor, element.fillOpacity);
            canvas.fill();

            // Check for no stroke color --> render rectangle stroke
            if (element.strokeWidth > 0 && element.strokeColor !== "transparent") {
                canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
                canvas.lineWidth = element.strokeWidth; // + px;
                // Check for line dash
                if (element.strokeDash === true) {
                    const lineDash = element.strokeWidth * 3;
                    canvas.setLineDash([lineDash, lineDash]); // Set default line-dash
                }
                else {
                    canvas.setLineDash([]); // Clear line-dash style
                }
                // Apply stroke
                canvas.stroke();
            }

            if (shouldDrawInnerText) {
                drawInnerText(canvas, element);
            }
            // context.globalAlpha = 1; // Reset opacity
        },
        update: () => null,
    },
    [ELEMENT_TYPES.SHAPE_ELLIPSE]: {
        init: options => ({
            resize: RESIZE_TYPES.ALL,
            fillColor: options.fillColor,
            fillOpacity: 1.0,
            strokeColor: options.strokeColor, // colors.black,
            strokeOpacity: 1.0,
            strokeWidth: 1,
            strokeDash: false,
            textAlign: "center",
            textVerticalAlign: "middle",
            textColor: options.textColor, // colors.black,
            textFont: options.fontFamily, // "sans-serif",
            textOpacity: 1.0,
            textSize: 16,
            textContent: ""
        }),
        draw: (canvas, element, shouldDrawInnerText) => {
            const rx = element.width / 2;
            const ry = element.height / 2;

            canvas.beginPath();
            canvas.ellipse(element.x + rx, element.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2*Math.PI);
            canvas.fillStyle = parseColor(element.fillColor, element.fillOpacity);
            canvas.fill();

            // Check for no stroke color --> render rectangle stroke
            if (element.strokeWidth > 0 && element.strokeColor !== "transparent") {
                canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
                canvas.lineWidth = element.strokeWidth; // + "px";
                // Check for line dash
                if (element.strokeDash === true) {
                    const lineDash = element.strokeWidth * 3;
                    canvas.setLineDash([lineDash, lineDash]);
                }
                else {
                    canvas.setLineDash([]);
                }
                // Apply stroke
                canvas.stroke();
            }

            if (shouldDrawInnerText) {
                drawInnerText(canvas, element);
            }
        },
        update: () => null,
    },
    [ELEMENT_TYPES.SHAPE_LINE]: {
        init: options => ({
            resize: RESIZE_TYPES.MAIN_DIAGONAL,
            strokeColor: options.strokeColor, // colors.black,
            strokeWidth: 1,
            strokeDash: false,
            strokeOpacity: 1.0,
            lineStart: "none",
            lineEnd: "none",
        }),
        draw: (canvas, element) => {
            if (element.strokeWidth === 0 || element.strokeColor === "transparent") {
                return null; // Nothing to render
            }
            const length = Math.sqrt(Math.pow(element.width, 2) + Math.pow(element.height, 2));
            canvas.beginPath();
            // canvas.globalAlpha = element.opacity;
            canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
            canvas.lineWidth = element.strokeWidth; // + "px";
            canvas.lineCap = "butt"; // Default linecap
            canvas.setLineDash([]); // Clear line-dash style
            if (element.strokeDash === true) {
                const lineDash = element.strokeWidth * 3;
                canvas.setLineDash([lineDash, lineDash]);
            }
            canvas.moveTo(element.x, element.y);
            canvas.lineTo(element.x + element.width, element.y + element.height);
            canvas.stroke();
            canvas.setLineDash([]); // Clear line-dash style
            // Add line start style
            if (element.lineStart && element.lineStart !== LINE_CAPS.NONE) {
                drawGlyph(canvas, element.lineStart, "start", element, length);
            }
            // Add line end style
            if (element.lineEnd && element.lineEnd !== LINE_CAPS.NONE) {
                drawGlyph(canvas, element.lineEnd, "end", element, length);
            }
            // canvas.globalAlpha = 1; // Reset opacity
        },
        update: () => null,
    },
    [ELEMENT_TYPES.TEXT]: {
        init: options => ({
            resize: RESIZE_TYPES.NONE,
            textAlign: "left",
            textColor: options.textColor,
            textSize: 16,
            textFont: options.fontFamily,
            textOpacity: 1.0,
            textContent: "",
        }),
        draw: (canvas, element, shouldDrawText) => {
            if (shouldDrawText) {
                canvas.save();
                canvas.beginPath();
                canvas.rect(element.x, element.y, element.width, element.height);
                canvas.clip();
                // canvas.globalAlpha = element.opacity;
                canvas.font = `${element.textSize}px ${element.textFont}`;
                canvas.textAlign = element.textAlign; // "start"; // Text left aligned
                canvas.textBaseline = "alphabetic"; // Default baseline
                canvas.fillStyle = parseColor(element.textColor, element.textOpacity);
                const lines = element.textContent.replace(/\r\n?/g, "\n").split("\n");
                let x = element.x; // Default left aligned
                if (element.textAlign === "center") {
                    x = x + element.width / 2; // Center text position
                }
                else if (element.textAlign === "right") {
                    x = x + element.width; // Right aligned text
                }
                // let lineHeight = element.height / lines.length;
                // let offset = element.height - element.baseline;
                for (let i = 0; i < lines.length; i++) {
                    canvas.fillText(lines[i], x, element.y + (i + 1) * element.textSize); 
                }
                canvas.restore();
            }
        },
        update: (element, changedKeys) => {
            if (changedKeys.has("textContent") || changedKeys.has("textSize") || changedKeys.has("textFont")) {
                Object.assign(element, {
                    ...measureText(element.textContent, element.textSize, element.textFont),
                });
            }
        },
    },
    [ELEMENT_TYPES.IMAGE]: {
        init: () => ({
            resize: RESIZE_TYPES.MAIN_DIAGONAL,
            content: null,
            img: null,
            opacity: 1.0,
        }),
        draw: (canvas, element) => {
            if (element.img) {
                canvas.globalAlpha = element.opacity;
                canvas.drawImage(element.img, element.x, element.y, element.width, element.height);
                canvas.globalAlpha = 1;
            }
        },
        update: () => null,
    },
};

// Create board
export const createBoard = (parent, opt) => {
    const options = {
        // Initial colors
        fillColor: "rgb(255,255,255)",
        strokeColor: "rgb(0,0,0)",
        textColor: "rgb(0,0,0)",
        // Selection values
        selectionColor: "rgb(78, 145, 228)",
        selectionOpacity: 0.1,
        // Screenshot value
        screenshotColor: "rgb(76, 205, 172)",
        screenshotOpacity: 0.2,
        // Default grid values
        gridColor: "rgb(238, 242, 247)", 
        gridWidth: 1, //Grid lines width
        gridOpacity: 0.8,
        gridSize: 10,
        gridStyle: "lined",
        // Element selection
        elementSelectionColor: "rgb(0,0,0)",
        elementSelectionWidth: 0.5,
        elementSelectionOpacity: 1.0,
        elementSelectionOffset: 4,
        // Element resize
        elementResizeColor: "rgb(0,0,0)",
        elementResizeWidth: 0.5,
        elementResizeOpacity: 1.0,
        elementResizeRadius: 5,
        // Group selection
        groupSelectionColor: "rgb(0,0,0)",
        groupSelectionWidth: 0.5,
        groupSelectionOpacity: 1,
        groupSelectionOffset: 8,
        // Text configuration
        fontFamily: "sans-serif",
        ...opt,
    };

    // Initialize board context
    const ctx = {
        parent: parent,
        canvas: createCanvas("100px", "100px"),
        canvasGrid: createCanvas("100px", "100px"),
        input: document.createElement("textarea"),
        options: options,
        mode: INTERACTION_MODES.NONE,
        type: ELEMENT_TYPES.SELECTION,
        typeLocked: false,
        currentGroup: null,
        currentElement: null,
        currentElementSelected: false,
        currentElementDragged: false,
        resizeOrientation: null,
        selection: [],
        selectionLocked: false,
        snapshot: [],
        elements: [],
        history: [],
        historyIndex: 0,
        width: 200,
        height: 200,
        grid: false,
        listeners: {},
    };

    // To register event listeners
    ctx.on = (name, fn) => (ctx.listeners[name] = ctx.listeners[name] || []).push(fn);
    ctx.off = (name, fn) => (ctx.listeners[name] || []).filter(f => f !== fn);
    ctx.trigger = (name, args) => (ctx.listeners[name] || []).forEach(fn => fn(args));

    // Draw the board
    ctx.draw = () => {
        const canvas = ctx.canvas.getContext("2d");
        const renderedGroups = new Set();
        canvas.clearRect(0, 0, ctx.width, ctx.height);
        forEachRev(ctx.elements, element => {
            const shouldDrawInnerText = ctx.mode !== INTERACTION_MODES.INPUT || ctx.currentElement?.id !== element.id;            
            ctx.drawElement(element, canvas, shouldDrawInnerText);

            // Check if this element is selected --> draw selection area
            if (shouldDrawInnerText && element.selected === true && element.type !== ELEMENT_TYPES.SELECTION) {
                const radius = ctx.options.elementResizeRadius;
                const offset = ctx.options.elementSelectionOffset;
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                canvas.globalAlpha = 1.0;
                canvas.beginPath();
                canvas.setLineDash([8, 4]);
                canvas.strokeStyle = ctx.options.elementSelectionColor;
                canvas.lineWidth = ctx.options.elementSelectionWidth;
                canvas.rect(xStart - offset, yStart - offset, xEnd - xStart + 2 * offset, yEnd - yStart + 2 * offset);
                canvas.stroke();
                canvas.setLineDash([]); // Reset line-dash
                // Check if is the unique selected elements
                if (ctx.selection.length === 1 && element.locked === false) {
                    getResizePoints(element, offset).forEach(p => {
                        canvas.beginPath();
                        canvas.strokeStyle = ctx.options.elementResizeColor;
                        canvas.lineWidth = ctx.options.elementResizeWidth;
                        canvas.fillStyle = "rgb(255,255,255)";
                        canvas.rect(p.x + p.xs * 2 * radius, p.y + p.ys * 2 * radius, 2 * radius, 2 * radius);
                        canvas.fill();
                        canvas.stroke();
                    });
                }
            }
            
            // Render group selection
            if (ctx.mode === INTERACTION_MODES.NONE && element.group) {
                if (!renderedGroups.has(element.group) && (element.selected || ctx.currentGroup === element.group)) {
                    const offset = ctx.options.groupSelectionOffset;
                    const group = ctx.getGroup(element.group);
                    canvas.globalAlpha = 1.0;
                    canvas.beginPath();
                    canvas.setLineDash([4, 2]);
                    canvas.strokeStyle = ctx.options.groupSelectionColor;
                    canvas.lineWidth = ctx.options.groupSelectionWidth;
                    canvas.rect(group.x - offset, group.y - offset, group.width + 2 * offset, group.height + 2 * offset);
                    canvas.stroke();
                    canvas.setLineDash([]);
                }
                renderedGroups.add(element.group);
            }
        });
    };

    ctx.drawGrid = () => {
        const canvas = ctx.canvasGrid.getContext("2d");
        canvas.clearRect(0, 0, ctx.width, ctx.height);
    
        // Check for drawing the grid
        if (ctx.grid === true) {
            canvas.globalAlpha = ctx.options.gridOpacity;
            canvas.beginPath();
            canvas.setLineDash([]);
            canvas.strokeStyle = ctx.options.gridColor;
            canvas.lineWidth = ctx.options.gridWidth; 
            // Horizontal rules
            for (let i = 0; i * ctx.options.gridSize < ctx.height; i++) {
                canvas.moveTo(0, i * ctx.options.gridSize);
                canvas.lineTo(ctx.width, i * ctx.options.gridSize);
            }
            // Vertical rules
            for (let i = 0; i * ctx.options.gridSize < ctx.width; i++) {
                canvas.moveTo(i * ctx.options.gridSize, 0);
                canvas.lineTo(i * ctx.options.gridSize, ctx.height);
            }
            // Draw the grid
            canvas.stroke();
            canvas.globalAlpha = 1;
        }
    };

    // Elements management
    ctx.createElement = element => ({
        ...elements[element.type].init(ctx.options),
        ...element,
        id: uid(),
        width: element.width || 0,
        height: element.height || 0,
        selected: false,
        locked: false,
        group: null,
    });
    ctx.updateElement = (el, changed) => elements[el.type].update(el, new Set(changed || []));
    ctx.drawElement = (el, canvas, shouldDrawInnerText) => elements[el.type].draw(canvas, el, shouldDrawInnerText);
    ctx.removeElement = el => {
        ctx.elements = ctx.elements.filter(element => element.id !== el.id);
        ctx.selection = ctx.selection.filter(element => element.id !== el.id);
    };
    ctx.addElement = element => {
        Object.assign(element, {
            selected: true, // Set element as selected
            x: ctx.getPosition((ctx.width - element.width) / 2),
            y: ctx.getPosition((ctx.height - element.height) / 2), 
        });
        ctx.elements.unshift(element); // Save the new element
        ctx.selection = ctx.getSelection(); // Update the selection
    };

    // Selection managers
    ctx.removeSelection = () => {
        ctx.elements = ctx.elements.filter(element => !element.selected);
        ctx.selection = [];
        if (ctx.currentGroup && !ctx.elements.some(el => el.group === ctx.currentGroup)) {
            ctx.currentGroup = null;
        }
    };
    ctx.clearSelection = () => {
        ctx.elements.forEach(element => element.selected = false);
        ctx.selection = [];
    };
    ctx.getSelection = () => ctx.elements.filter(element => element.selected);
    ctx.isSelectionLocked = () => ctx.selection.every(element => element.locked);
    ctx.setSelection = selection => {
        const [sxStart, sxEnd] = getAbsolutePositions(selection.x, selection.width);
        const [syStart, syEnd] = getAbsolutePositions(selection.y, selection.height);
        const selectedGroups = new Set();

        ctx.elements.forEach(element => {
            if (element.type !== ELEMENT_TYPES.SELECTION && element.type !== ELEMENT_TYPES.SCREENSHOT) {
                if (!ctx.currentGroup && element.group && selectedGroups.has(element.group)) {
                    element.selected = true;
                    return;
                }
                // Get element absolute positions
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                // Set if this element is selected
                element.selected = sxStart <= xStart && syStart <= yStart && xEnd <= sxEnd && yEnd <= syEnd;

                // Add the group of this element to the list of groups
                if (!ctx.currentGroup && element.group && element.selected) {
                    selectedGroups.add(element.group);
                }
            }
        });

        // Check for adding other elements in groups
        if (selectedGroups.size > 0) {
            ctx.elements.forEach(element => {
                if (element.group && selectedGroups.has(element.group)) {
                    element.selected = true;
                }
            });
        }
    };

    // Group managers
    ctx.groupSelection = () => {
        const group = uid();
        ctx.registerSelectionUpdate(["group"], [group], false);
        ctx.selection.forEach(element => element.group = group);
        ctx.currentGroup = null;
    };
    ctx.ungroupSelection = () => {
        ctx.registerSelectionUpdate(["group"], [null], false);
        ctx.selection.forEach(element => element.group = null);
        ctx.currentGroup = null;
    };
    ctx.getGroupsInSelection = () => {
        const groups = new Set();
        ctx.selection.forEach(el => el.group && groups.add(el.group));
        return Array.from(groups);
    };
    ctx.selectAllElementsInGroup = id => {
        ctx.elements.forEach(element => element.selected = element.group === id || element.selected);
    };
    ctx.getGroup = id => {
        let xStart = Infinity, yStart = Infinity, xEnd = 0, yEnd = 0;
        ctx.elements.forEach(el => {
            if (el.group === id) {
                const [x0, x1] = getAbsolutePositions(el.x, el.width);
                const [y0, y1] = getAbsolutePositions(el.y, el.height);
                xStart = Math.min(x0, xStart);
                xEnd = Math.max(x1, xEnd);
                yStart = Math.min(y0, yStart);
                yEnd = Math.max(y1, yEnd);
            }
        });
        return {
            // id: id,
            // elements: [],
            x: xStart,
            y: yStart,
            width: Math.abs(xEnd - xStart),
            height: Math.abs(yEnd - yStart),
        };
    };

    // History elements
    ctx.addHistoryEntry = entry => {
        if (ctx.historyIndex > 0) {
            ctx.history = ctx.history.slice(ctx.historyIndex);
            ctx.historyIndex = 0;
        }
        // Check for updating the same elements and the same keys
        if (entry.keys && entry.ids && ctx.history.length > 0) {
            const last = ctx.history[0];
            if (last.ids === entry.ids && last.keys === entry.keys) {
                const keys = entry.keys.split(",");
                last.elements.forEach((element, index) => {
                    element.newValues = Object.fromEntries(keys.map(key => {
                        return [key, entry.elements[index].newValues[key]];
                    }));
                });
                return;
            }
        }
        // Register the new history entry
        ctx.history.unshift(entry);
    };
    ctx.registerSelectionUpdate = (keys, values, groupChanges) => {
        ctx.addHistoryEntry({
            type: ELEMENT_CHANGE_TYPES.UPDATE,
            ids: groupChanges && ctx.selection.map(el => el.id).join(","),
            keys: groupChanges && keys.join(","),
            elements: ctx.selection.map(element => ({
                id: element.id,
                prevValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                newValues: Object.fromEntries(keys.map((key, index) => [key, values[index]])),
            })),
        });
    };
    ctx.registerSelectionRemove = () => {
        ctx.addHistoryEntry({
            type: ELEMENT_CHANGE_TYPES.REMOVE,
            elements: ctx.selection.map(element => ({
                id: element.id,
                prevValues: {...element},
                newValues: null,
            })),
        });
    };
    ctx.registerElementCreate = element => {
        ctx.addHistoryEntry({
            type: ELEMENT_CHANGE_TYPES.CREATE,
            elements: [{
                id: element.id,
                prevValues: null,
                newValues: {...element},
            }],
        });
    };
    ctx.registerElementRemove = element => {
        ctx.addHistoryEntry({
            type: ELEMENT_CHANGE_TYPES.REMOVE,
            elements: [{
                id: element.id,
                prevValues: {...element},
                newValues: null,
            }],
        });
    };

    // Text input managers
    ctx.showInput = () => {
        ctx.input.style.top = ctx.currentElement.y + "px";
        ctx.input.style.left = ctx.currentElement.x + "px";
        ctx.input.style.color = ctx.currentElement.textColor;
        ctx.input.style.fontSize = ctx.currentElement.textSize + "px";
        ctx.input.style.fontFamily = ctx.currentElement.textFont;
        ctx.input.style.textAlign = ctx.currentElement.textAlign;
        ctx.input.value = ctx.currentElement.textContent || ""; // Get text content
        ctx.input.style.display = "inline-block"; // Show input
        ctx.input.focus(); // focus in the new input
        ctx.updateInput();
    };
    ctx.hideInput = () => {
        ctx.input.style.display = "none";
        ctx.input.value = ""; // Remove current value
        ctx.input.blur();
    };
    ctx.updateInput = () => {
        ctx.input.style.height = "1em";
        const size = measureText(ctx.input.value || "", ctx.currentElement.textSize, ctx.currentElement.textFont);
        const width = Math.max(size.width + 1, ctx.currentElement.width);
        const height = ctx.input.scrollHeight; // .max(ctx.input.scrollHeight, ctx.currentElement.height);
        ctx.input.style.width = width;
        ctx.input.style.height = height;

        // Move text input to the correct position
        if (ctx.currentElement.type !== "text") {
            // Vertical align
            if (ctx.currentElement.textVerticalAlign === TEXT_VERTICAL_ALIGNS.MIDDLE) {
                ctx.input.style.top = ctx.currentElement.y + (ctx.currentElement.height - height) / 2;
            }
            else if (ctx.currentElement.textVerticalAlign === TEXT_VERTICAL_ALIGNS.BOTTOM) {
                ctx.input.style.top = ctx.currentElement.y + (ctx.currentElement.height - height);
            }
            // Horizontal align
            if (ctx.currentElement.textAlign === TEXT_ALIGNS.CENTER) {
                ctx.input.style.left = ctx.currentElement.x - (width - ctx.currentElement.width) / 2;
            }
            else if (ctx.currentElement.textAlign === TEXT_ALIGNS.RIGHT) {
                ctx.input.style.left = ctx.currentElement.x - (width - ctx.currentElement.width);
            }
        }
    };
    ctx.submitInput = () => {
        const first = ctx.history[0] || null;
        const value = ctx.input.value || "";
        const element = ctx.currentElement;
        const prevContent = element.textContent;
        element.selected = true;
        ctx.selection = ctx.getSelection();
        ctx.selectionLocked = false;
        if (value || element.type !== ELEMENT_TYPES.TEXT) {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                first.elements[0].textContent = value; // Replace the value in history
            } else {
                ctx.registerSelectionUpdate(["textContent"], [value], false);
            }
            element.textContent = value;
            ctx.updateElement(element, ["textContent"]);
        } else {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                ctx.history.shift(); // remove this from history
            } else {
                ctx.registerElementRemove(element);
            }
            ctx.removeElement(element);
            ctx.selection = ctx.getSelection();
        }
        ctx.currentElement = null;
        ctx.mode = INTERACTION_MODES.NONE; // Reset mode
        ctx.hideInput();
    };

    // Calculate the position
    ctx.getPosition = v => {
        return ctx.grid ? Math.round(v / ctx.options.gridSize) * ctx.options.gridSize : v;
    };

    // Handle paste
    const handlePaste = event => {
        return !isInputTarget(event) && getDataFromClipboard(event).then(data => {
            ctx.clearSelection(); // Clear the current selection
            ctx.currentGroup = null;
            parseClipboardBlob(data.type, data.blob).then(content => {
                // Check for not image type
                if (data.type !== "image") {
                    const element = ctx.createElement({
                        type: ELEMENT_TYPES.TEXT,
                        textContent: content,
                    });
                    ctx.addElement(element);
                    ctx.updateElement(element, ["x", "y", "textContent"]);
                    ctx.registerElementCreate(element);
                    ctx.draw();
                    return ctx.trigger("update");
                }
                // Load as a new image
                createImage(content).then(img => {
                    const element = ctx.createElement({
                        type: ELEMENT_TYPES.IMAGE,
                        width: img.width,
                        height: img.height,
                        img: img,
                    });
                    ctx.addElement(element);
                    ctx.updateElement(element, ["img", "width", "height"]);
                    ctx.registerElementCreate(element);
                    ctx.draw();
                    ctx.trigger("update");
                });
            });
        });
    };

    // Handle document key down
    const handleKeyDown = event => {
        if (ctx.mode === INTERACTION_MODES.INPUT || isInputTarget(event)) {
            if (ctx.mode === INTERACTION_MODES.INPUT && event.key === KEYS.ESCAPE) {
                event.preventDefault();
                ctx.submitInput();
                ctx.draw();
                ctx.trigger("update");
            }
        }
        // Check ESCAPE key --> reset selection
        else if (event.key === KEYS.ESCAPE) {
            event.preventDefault();
            ctx.clearSelection();
            ctx.currentGroup = null;
            ctx.draw();
            ctx.trigger("update");
        }
        // Check for backspace key --> remove elements
        else if (event.key === KEYS.BACKSPACE) {
            event.preventDefault();
            ctx.registerSelectionRemove();
            ctx.removeSelection();
            ctx.draw();
            ctx.trigger("update");
        }
        // Check for arrow keys --> move elements
        else if (isArrowKey(event.key) === true) {
            event.preventDefault();
            const step = ctx.grid ? ctx.options.gridSize : (event.shiftKey ? 5 : 1);
            const key = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
            const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;

            ctx.addHistoryEntry({
                type: ELEMENT_CHANGE_TYPES.UPDATE,
                ids: ctx.selection.map(el => el.id).join(","),
                keys: key,
                elements: ctx.selection.map(element => {
                    const prevValue = element[key];
                    element[key] = prevValue + step * sign;
                    return {
                        id: element.id,
                        prevValues: {[key]: prevValue},
                        newValues: {[key]: element[key]},
                    };
                }),
            });
            ctx.draw();
            ctx.trigger("update");
        }
    };

    // Handle pointer down event
    const handlePointerDown = event => {
        event.preventDefault();

        // Remove current selection
        const currentSelection = document.getSelection();
        if (currentSelection?.anchorNode) {
            currentSelection.removeAllRanges();
        }

        // Check for text input mode --> submit text
        if (ctx.mode === INTERACTION_MODES.INPUT) {
            ctx.submitInput();
            ctx.draw();
            ctx.trigger("update");
            return;
        }

        ctx.currentElement = null;
        ctx.lastX = event.offsetX; // event.clientX - event.target.offsetLeft;
        ctx.lastY = event.offsetY; // event.clientY - event.target.offsetTop;
        ctx.currentElementDragged = false;
        ctx.currentElementSelected = false;

        // Check if we are in a resize point
        if (ctx.selection.length === 1) {
            const radius = 2 * ctx.options.elementResizeRadius;
            const offset = ctx.options.elementSelectionOffset;
            const point = inResizePoint(ctx.selection[0], ctx.lastX, ctx.lastY, radius, offset);
            if (point) {
                ctx.currentElement = ctx.selection[0]; // Save current element
                ctx.resizeOrientation = fixResizeOrientation(ctx.currentElement, point.orientation);
                ctx.mode = INTERACTION_MODES.RESIZE; // Swtich to resize mode
                ctx.snapshot = snapshotSelection(ctx.selection); // Create a snapshot of the selection
                return; // Stop event
            }
        }
        // Check the selected type
        if (ctx.type === ELEMENT_TYPES.SELECTION) {
            // Check if the point is inside an element
            const insideElements = ctx.elements.filter(element => {
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                // Check if the position is inside the element
                return (xStart <= ctx.lastX && ctx.lastX <= xEnd) 
                    && (yStart <= ctx.lastY && ctx.lastY <= yEnd);
            });
            if (insideElements.length > 0) {
                const el = insideElements[0]; // Get only the first element
                ctx.currentElement = el; // Save the current dragged element
                ctx.currentElementSelected = el.selected; // Save if element is already selected
                ctx.mode = INTERACTION_MODES.DRAG;
                // Check if this element is not selected
                if (el.selected === false && !event.shiftKey) {
                    ctx.clearSelection(); // Remove other elements
                }
                // Add elements of this group
                if (!ctx.currentGroup && el.group) {
                    ctx.selectAllElementsInGroup(el.group);
                }
                el.selected = true;
                ctx.selection = ctx.getSelection();
                ctx.snapshot = snapshotSelection(ctx.selection);
                ctx.selectionLocked = ctx.isSelectionLocked();
                return; // Stop event
            }
        }
        // Create a new element
        const element = ctx.createElement({
            type: ctx.type,
            x: ctx.getPosition(ctx.lastX), 
            y: ctx.getPosition(ctx.lastY),
        });
        ctx.elements.unshift(element);
        ctx.currentElement = element;
        ctx.clearSelection();

        // Check if we should clear the current group
        if (ctx.currentGroup && element.type === ELEMENT_TYPES.SELECTION) {
            const g = ctx.getGroup(ctx.currentGroup);
            if (element.x < g.x || g.x + g.width < element.x || element.y < g.y || g.y + g.height < element.y) {
                ctx.currentGroup = null; // Reset current group
            }
        } else {
            // Clear the current group just in case
            ctx.currentGroup = null;
        }
    };

    // Handle pointer move
    const handlePointerMove = event => {
        event.preventDefault();
        const x = event.offsetX; // event.clientX - event.target.offsetLeft;
        const y = event.offsetY; // event.clientY - event.target.offsetTop;
        // Check for no selected elements
        if (!ctx.currentElement || ctx.mode === INTERACTION_MODES.INPUT) {
            return;
        }
        ctx.currentElementDragged = true;
        // Check if we are resizing the element
        if (ctx.mode === INTERACTION_MODES.RESIZE) {
            if (ctx.currentElement.locked) {
                return null;
            }
            const element = ctx.currentElement;
            const snapshot = ctx.snapshot[0]; // Get snapshot of the current element
            const orientation = ctx.resizeOrientation;
            const deltaX = x - ctx.lastX; // ctx.getPosition(x - ctx.lastX);
            const deltaY = y - ctx.lastY; // ctx.getPosition(y - ctx.lastY);
            // Check the orientation
            if (orientation === RESIZE_ORIENTATIONS.RIGHT) {
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
            }
            else if (orientation === RESIZE_ORIENTATIONS.LEFT) {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.width = snapshot.width + (snapshot.x - element.x);
            }
            else if (orientation === RESIZE_ORIENTATIONS.BOTTOM) {
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
            else if (orientation === RESIZE_ORIENTATIONS.TOP) {
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (orientation === RESIZE_ORIENTATIONS.LEFT_TOP) {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (orientation === RESIZE_ORIENTATIONS.RIGHT_TOP) {
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.height = snapshot.height + (snapshot.y - element.y);
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
            }
            else if (orientation === RESIZE_ORIENTATIONS.LEFT_BOTTOM) {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
            else if (orientation === RESIZE_ORIENTATIONS.RIGHT_BOTTOM) {
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
        }
        // Check if we have selected elements
        else if (ctx.mode === INTERACTION_MODES.DRAG && ctx.selection.length > 0) {
            if (ctx.selectionLocked) {
                return null; // Move is not allowed --> selection is locked
            }
            const incrementX = x - ctx.lastX;
            const incrementY = y - ctx.lastY;
            // Move all elements
            ctx.selection.forEach((element, index) => {
                if (!element.locked) {
                    element.x = ctx.getPosition(ctx.snapshot[index].x + incrementX);
                    element.y = ctx.getPosition(ctx.snapshot[index].y + incrementY);
                }
            });
        }
        // Check if we have a drag element (but not text)
        else if (ctx.currentElement && ctx.currentElement.type !== ELEMENT_TYPES.TEXT) {
            const element = ctx.currentElement;
            const deltaX = ctx.getPosition(x - element.x);
            //let deltaY = this.ctx.getPosition(y - element.y);
            element.width = deltaX;
            element.height = event.shiftKey ? deltaX : ctx.getPosition(y - element.y);

            // Check if the elemement is a selection
            if (element.type === ELEMENT_TYPES.SELECTION) {
                ctx.setSelection(element);
            }
        }
        // Check for text element --> update only text position
        else if (ctx.currentElement && ctx.currentElement.type === ELEMENT_TYPES.TEXT) {
            ctx.currentElement.x = ctx.getPosition(x);
            ctx.currentElement.y = ctx.getPosition(y);
        }

        ctx.draw();
    };

    // Handle pointer up
    const handlePointerUp = event => {
        event.preventDefault();
        // Check for no current element active
        if (!ctx.currentElement || ctx.mode === INTERACTION_MODES.INPUT) {
            return;
        }
        // Check for clicked element
        if (!ctx.currentElementDragged && ctx.selection.length > 0) {
            if (ctx.currentElementSelected === true && event.shiftKey) {
                ctx.currentElement.selected = false;
            }
            // Check if no shift key is pressed --> keep only this current element in selection
            else if (!event.shiftKey) {
                ctx.clearSelection();
                ctx.currentElement.selected = true;
            }
            // Check if this elements is part of a group
            // This will disable the shift action if the element is in a group
            if (ctx.currentElement.group && !ctx.currentGroup) {
                ctx.selectAllElementsInGroup(ctx.currentElement.group);
            }
        }
        // Check for adding a new element
        if (ctx.type !== ELEMENT_TYPES.SELECTION && ctx.type !== ELEMENT_TYPES.SCREENSHOT) {
            ctx.currentElement.selected = true;
            ctx.updateElement(ctx.currentElement, ["selected"]);
            ctx.registerElementCreate(ctx.currentElement);
        }
        // Remove selection elements
        else {
            ctx.elements = ctx.elements.filter(element => {
                return element.type !== ELEMENT_TYPES.SELECTION && element.type !== ELEMENT_TYPES.SCREENSHOT;
            });
        }
        // Check for screenshot element
        if (ctx.type === ELEMENT_TYPES.SCREENSHOT) {
            const [xStart, xEnd] = getAbsolutePositions(ctx.currentElement.x, ctx.currentElement.width);
            const [yStart, yEnd] = getAbsolutePositions(ctx.currentElement.y, ctx.currentElement.height);
            ctx.trigger("screenshot", {
                x: xStart,
                width: xEnd - xStart,
                y: yStart,
                height: yEnd - yStart,
            });
        }
        else if (ctx.selection.length > 0 || ctx.currentElementDragged) {
            if (ctx.mode === INTERACTION_MODES.DRAG || ctx.mode === INTERACTION_MODES.RESIZE) {
                const keys = ctx.mode === INTERACTION_MODES.DRAG ? ["x", "y"] : ["x", "y", "width", "height"];
                ctx.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    elements: ctx.selection.map((element, index) => ({
                        id: element.id,
                        prevValues: Object.fromEntries(keys.map(key => [key, ctx.snapshot[index][key]])),
                        newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    })),
                });
            }
        }
        // Check for text element
        if (ctx.type === ELEMENT_TYPES.TEXT) {
            ctx.currentElement.selected = false; // Disable selection
            ctx.mode = INTERACTION_MODES.INPUT;
            ctx.showInput();
        }
        // If no text element, reset current element
        else {
            ctx.currentElement = null;
            ctx.mode = INTERACTION_MODES.NONE;
        }
        
        // Reset selection
        ctx.selection = ctx.getSelection();
        ctx.selectionLocked = ctx.isSelectionLocked();
        ctx.type = ELEMENT_TYPES.SELECTION;
        ctx.draw();
        ctx.trigger("update");
    };

    // Handle double click
    const handleDoubleClick = event => {
        event.preventDefault();
        // Check if all selected elements are in a group
        if (ctx.selection.length > 0 && !ctx.currentGroup) {
            const group = ctx.selection[0].group;
            const sameGroup = ctx.selection.every(el => el.group === group);
            if (group && sameGroup) {
                ctx.clearSelection();
                ctx.currentGroup = group;
                ctx.draw();
                ctx.trigger("update");
                return;
            }
        }
        // if (ctx.selection.length === 1 && ctx.selection[0].type === "text") {
        if (ctx.selection.length === 1 && typeof ctx.selection[0].textContent === "string") {
            ctx.currentElement = ctx.selection[0];
        }
        else {
            ctx.currentElement = ctx.createElement({
                type: ELEMENT_TYPES.TEXT,
                x: parseInt(event.clientX),
                y: parseInt(event.clientY),
            });
            ctx.elements.unshift(ctx.currentElement);
            ctx.registerElementCreate(ctx.currentElement);
        }
        ctx.mode = INTERACTION_MODES.INPUT;
        ctx.clearSelection();
        ctx.showInput();
        ctx.draw();
        ctx.trigger("update");
    };

    // Handle window resize
    const handleResize = () => {
        ctx.width = ctx.parent.offsetWidth;
        ctx.height = ctx.parent.offsetHeight;
        ctx.canvas.setAttribute("width", ctx.width + "px");
        ctx.canvas.setAttribute("height", ctx.height + "px");
        ctx.canvasGrid.setAttribute("width", ctx.width + "px");
        ctx.canvasGrid.setAttribute("height", ctx.height + "px");
        ctx.draw();
        ctx.drawGrid();
        // ctx.trigger("update");
    };

    // Append elements and update parent styles
    ctx.parent.style.width = "100%";
    ctx.parent.style.height = "100%";
    ctx.parent.style.position = "relative";
    // ctx.parent.style.top = "0px";
    // ctx.parent.style.left = "0px";
    
    // Apply body styles
    // document.querySelector("body").style.touchAction = "pan-y";
    document.querySelector("body").style.overflow = "hidden";

    // Canvas styles
    [ctx.canvas, ctx.canvasGrid].forEach(el => {
        el.style.userSelect = "none";
        el.style.touchAction = "none";
        el.style.position = "absolute";
        el.style.top = "0px";
        el.style.bottom = "0px";
    });

    // Input style
    ctx.input.style.display = "none";
    ctx.input.style.position = "absolute";
    ctx.input.style.width = "auto";
    ctx.input.style.minWidth = "1em";
    ctx.input.style.minHeight = "1em";
    ctx.input.style.outline = "0px";
    ctx.input.style.border = "0px solid transparent";
    // ctx.input.style.padding = "0px";
    ctx.input.style.padding = "3px 0px"; // Terrible hack to fix text position
    ctx.input.style.margin = "0px";
    ctx.input.style.resize = "none";
    ctx.input.style.overflow = "hidden";
    ctx.input.style.lineHeight = "1";
    ctx.input.style.backgroundColor = "transparent";
    ctx.input.style.wordBreak = "pre";
    ctx.input.style.whiteSpace = "break-word";

    // Append child items
    ctx.parent.style.width = "100%";
    ctx.parent.style.height = "100%";
    ctx.parent.style.overflow = "hidden";
    ctx.parent.appendChild(ctx.canvas);
    ctx.parent.appendChild(ctx.canvasGrid);
    ctx.parent.appendChild(ctx.input);

    // Register event listeners
    ctx.canvasGrid.addEventListener("pointerdown", handlePointerDown);
    ctx.canvasGrid.addEventListener("pointermove", handlePointerMove);
    ctx.canvasGrid.addEventListener("pointerup", handlePointerUp);
    ctx.canvasGrid.addEventListener("dblclick", handleDoubleClick);

    // Register text input event listeners
    ctx.input.addEventListener("input", () => ctx.updateInput());
    ctx.input.addEventListener("mousedown", e => e.stopPropagation());
    ctx.input.addEventListener("mouseup", e => e.stopPropagation());

    // Register document event listeners
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("paste", handlePaste, false);
    window.addEventListener("resize", handleResize, false);

    // Force a resize of the canvas
    handleResize();
    // ctx.draw();

    // Remove all event listeners
    ctx.destroy = () => {
        //Remove window/document listeners
        document.removeEventListener("keydown", handleKeyDown, false);
        document.removeEventListener("paste", handlePaste, false);
        window.removeEventListener("resize", handleResize, false);

        // Remove dom elements
        ctx.parent.removeChild(ctx.canvas);
        ctx.parent.removeChild(ctx.canvasGrid);
        ctx.parent.removeChild(ctx.input);

        // Reset body styles
        document.querySelector("body").style.overflow = "";
    };

    // Return public api
    return {
        on: ctx.on,
        off: ctx.off,
        destroy: ctx.destroy,
        clear: () => {
            ctx.elements = [];
            ctx.selection = [];
            ctx.groups = {};
            ctx.draw();
        },
        getOptions: () => ctx.options,
        updateOptions: newOptions => {
            Object.assign(ctx.options, newOptions);
            ctx.draw();
        },
        forceUpdate: () => {},
        // load: null,
        export: () => ({
            elements: ctx.elements.map(element => ({
                ...element,
                selected: false,
            })),
            width: ctx.width,
            height: ctx.height,
        }),
        setType: type => {
            ctx.clearSelection();
            ctx.type = type || ELEMENT_TYPES.SELECTION;
            ctx.draw();
        },
        getType: () => ctx.type,
        updateSelection: (key, value) => {
            ctx.registerSelectionUpdate([key], [value], true);
            ctx.selection.forEach(element => {
                element[key] = value;
                ctx.updateElement(element, [key]);
            });
            ctx.draw();
        },
        cloneSelection: () => {
            const newElements = [];
            // Update the selection with the cloned elements
            ctx.selection = ctx.selection.map(element => {
                const clonedElement = {
                    ...element,
                    x: element.x + 10,
                    y: element.y + 10,
                    locked: false, // Reset locked attribute
                };
                newElements.push(clonedElement); // Save to the elements list
                element.selected = false; // Remove this element from selection
                return clonedElement;
            });
            forEachRev(newElements, el => ctx.elements.unshift(el));
            ctx.selectionLocked = false; // Reset selection locked flag
            ctx.draw();
        },
        lockSelection: () => {
            ctx.registerSelectionUpdate(["locked"], [true], false);
            ctx.selectionLocked = true;
            ctx.selection.forEach(element => element.locked = true);
            ctx.draw();
        },
        unlockSelection: () => {
            ctx.registerSelectionUpdate(["locked"], [false], false);
            ctx.selectionLocked = false;
            ctx.selection.forEach(element => element.locked = false);
            ctx.draw();
        },
        clearSelection: () => {
            ctx.clearSelection();
            ctx.draw();
        },
        removeSelection: () => {
            ctx.registerSelectionRemove();
            ctx.removeSelection();
            ctx.draw();
        },
        bringSelectionForward: () => {
            // forEachRev(ctx.selection, element => {
            //     const index = ctx.elements.findIndex(el => el.id === element.id);
            //     ctx.elements.splice(index, 1);
            //     ctx.elements.splice(Math.max(index - 1, 0), 0, element);
            // });
            // ctx.draw();
        },
        sendSelectionBackward: () => {
            // ctx.selection.forEach(element => {
            //     const index = ctx.elements.findIndex(el => el.id === element.id);
            //     ctx.elements.splice(index, 1);
            //     ctx.elements.splice(Math.min(index + 1, ctx.elements.length), 0, element);
            // });
            // ctx.draw();
        },
        getSelection: () => ctx.selection,
        isSelectionLocked: () => ctx.selectionLocked,
        groupSelection: () => {
            ctx.groupSelection();
            ctx.draw();
        },
        ungroupSelection: () => {
            ctx.ungroupSelection();
            ctx.draw();
        },
        getActiveGroup: () => ctx.currentGroup,
        undo: () => {
            if (ctx.historyIndex < ctx.history.length) {
                const entry = ctx.history[ctx.historyIndex];
                if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    ctx.elements = ctx.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                    entry.elements.forEach(el => ctx.elements.unshift({...el.prevValues}));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(ctx.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                ctx.historyIndex = ctx.historyIndex + 1;
                ctx.clearSelection();
                ctx.currentGroup = null;
                ctx.draw();
            }
        },
        redo: () => {
            if (ctx.historyIndex > 0 && ctx.history.length > 0) {
                ctx.historyIndex = ctx.historyIndex - 1;
                const entry = ctx.history[ctx.historyIndex];
                if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                    entry.elements.forEach(el => ctx.elements.unshift({...el.newValues}));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    ctx.elements = ctx.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(ctx.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                ctx.clearSelection();
                ctx.currentGroup = null;
                ctx.draw();
            }
        },
        isUndoDisabled: () => ctx.historyIndex >= ctx.history.length,
        isRedoDisabled: () => ctx.historyIndex === 0 || ctx.history.length < 1,
        screenshot: region => screenshot(ctx.canvas, region),
    };
};
