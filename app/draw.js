import {
    MODES,
    ELEMENT_TYPES,
    DEFAULT_ELEMENT_RESIZE_RADIUS,
    DEFAULT_ELEMENT_SELECTION_OFFSET,
    DEFAULT_ELEMENT_SELECTION_COLOR,
    DEFAULT_ELEMENT_SELECTION_WIDTH,
    DEFAULT_ELEMENT_RESIZE_COLOR,
    DEFAULT_ELEMENT_RESIZE_WIDTH,
    DEFAULT_GROUP_SELECTION_COLOR,
    DEFAULT_GROUP_SELECTION_OFFSET,
    DEFAULT_GROUP_SELECTION_WIDTH,
    DEFAULT_SELECTION_COLOR,
    DEFAULT_SELECTION_OPACITY,
    DEFAULT_GRID_WIDTH,
} from "./constants.js";
import {drawElement} from "./elements.js";
import {getResizePoints} from "./resize.js";
import {getAbsolutePositions, getOuterRectangle} from "./utils/math.js";

const forEachRev = (list, callback) => {
    for (let i = list.length - 1; i >= 0; i--) {
        callback(list[i], i);
    }
};

export const drawBoard = (canvas, elements, selection, options) => {
    const ctx = canvas.getContext("2d");
    const mode = options.mode || MODES.NONE;
    const renderedGroups = new Set();
    const selectedElements = elements.filter(el => el.selected);
    if (options.clear) {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    }
    ctx.translate(options.translateX || 0, options.translateY || 0);
    ctx.scale(options.zoom, options.zoom);
    forEachRev(elements, element => {
        const drawInnerText = options.drawActiveInnerText || options.activeElement?.id !== element.id;
        drawElement(element, ctx, {
            drawInnerText: drawInnerText,
        });
        // Check if this element is selected --> draw selection area
        if (drawInnerText && element.selected) {
            const radius = DEFAULT_ELEMENT_RESIZE_RADIUS / options.zoom;
            const offset = DEFAULT_ELEMENT_SELECTION_OFFSET / options.zoom;
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.setLineDash([8 / options.zoom, 4 / options.zoom]);
            ctx.strokeStyle = DEFAULT_ELEMENT_SELECTION_COLOR;
            ctx.lineWidth = DEFAULT_ELEMENT_SELECTION_WIDTH / options.zoom;
            ctx.rect(xStart - offset, yStart - offset, xEnd - xStart + 2 * offset, yEnd - yStart + 2 * offset);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line-dash
            // Check if is the unique selected elements
            if (selectedElements.length === 1 && !element.locked) {
                getResizePoints(element, offset).forEach(p => {
                    ctx.beginPath();
                    ctx.strokeStyle = DEFAULT_ELEMENT_RESIZE_COLOR;
                    ctx.lineWidth = DEFAULT_ELEMENT_RESIZE_WIDTH / options.zoom;
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.rect(p.x + p.xs * 2 * radius, p.y + p.ys * 2 * radius, 2 * radius, 2 * radius);
                    ctx.fill();
                    ctx.stroke();
                });
            }
        }
        // Render group selection
        if (!options.pointerMoveActive && mode !== MODES.SCREENSHOT && element.group) {
            if (!renderedGroups.has(element.group) && (element.selected || options.activeGroup === element.group)) {
                const offset = DEFAULT_GROUP_SELECTION_OFFSET / options.zoom;
                const groupElements = elements.filter(el => el.group === element.group);
                const group = getOuterRectangle(groupElements);
                ctx.globalAlpha = 1.0;
                ctx.beginPath();
                ctx.setLineDash([4 / options.zoom, 2 / options.zoom]);
                ctx.strokeStyle = DEFAULT_GROUP_SELECTION_COLOR;
                ctx.lineWidth = DEFAULT_GROUP_SELECTION_WIDTH / options.zoom;
                ctx.rect(group.x - offset, group.y - offset, group.width + 2 * offset, group.height + 2 * offset);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            renderedGroups.add(element.group);
        }
    });
    // Render selection (if provided)
    if (selection && (mode === MODES.SELECTION || mode === MODES.SCREENSHOT)) {
        ctx.globalAlpha = DEFAULT_SELECTION_OPACITY;
        ctx.beginPath();
        ctx.fillStyle = DEFAULT_SELECTION_COLOR;
        ctx.rect(selection.x, selection.y, selection.width, selection.height);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    ctx.scale(1, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawGrid = (canvas, options) => {
    const x = (Math.ceil((options.translateX || 0) / options.size) * options.size) / options.zoom;
    const y = (Math.ceil((options.translateY || 0) / options.size) * options.size) / options.zoom;
    const width = options.width / options.zoom;
    const height = options.height / options.zoom;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, options.width, options.height);
    ctx.translate(options.translateX || 0, options.translateY || 0);
    ctx.scale(options.zoom, options.zoom);
    ctx.globalAlpha = options.opacity;
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = options.color;
    ctx.lineWidth = DEFAULT_GRID_WIDTH;
    // Horizontal rules
    for (let i = 0; i * options.size < height; i++) {
        ctx.moveTo(-x, i * options.size - y);
        ctx.lineTo(width - x, i * options.size - y);
    }
    // Vertical rules
    for (let i = 0; i * options.size < width; i++) {
        ctx.moveTo(i * options.size - x, -y);
        ctx.lineTo(i * options.size - x, height - y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.scale(1, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
};
