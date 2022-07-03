import {
    ELEMENT_TYPES,
    LINE_CAPS,
    RESIZE_TYPES,
    TEXT_ALIGNS,
} from "../constants.js";
import {parseColor} from "../utils/colors.js";

// Draw a simple rectangle
const drawSimpleRectangle = (canvas, element) => {
    canvas.globalAlpha = element.opacity;
    canvas.beginPath();
    canvas.fillStyle = element.color;
    canvas.rect(element.x, element.y, element.width, element.height);
    canvas.fill();
    canvas.globalAlpha = 1;
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
        draw: (canvas, element) => drawSimpleRectangle(canvas, element),
        update: () => null,
    },
    [ELEMENT_TYPES.SCREENSHOT]: {
        init: options => ({
            resize: RESIZE_TYPES.NONE,
            color: options.screenshotColor,
            opacity: options.screenshotOpacity,
        }),
        draw: (canvas, element) => drawSimpleRectangle(canvas, element),
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

export const createElement = element => ({
    ...elements[element.type].init(ctx.options),
    ...element,
    id: generateID(),
    width: element.width || 0,
    height: element.height || 0,
    selected: false,
    locked: false,
    group: null,
});

export const updateElement = (el, changed) => {
    return elements[el.type].update(el, new Set(changed || []));
};

export const drawElement = (el, canvas, shouldDrawInnerText) => {
    return elements[el.type].draw(canvas, el, shouldDrawInnerText);
};

export const removeElement = (ctx, el) => {
    ctx.elements = ctx.elements.filter(element => element.id !== el.id);
    ctx.selection = ctx.selection.filter(element => element.id !== el.id);
};

export const addElement = (ctx, el) => {
    Object.assign(el, {
        selected: true, // Set element as selected
        x: ctx.getPosition((ctx.width - el.width) / 2),
        y: ctx.getPosition((ctx.height - el.height) / 2), 
    });
    ctx.elements.unshift(el); // Save the new element
    ctx.selection = ctx.elements.filter(e => e.selected); // update the selection
};
