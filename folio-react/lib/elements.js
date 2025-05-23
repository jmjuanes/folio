import {uid} from "uid/secure";
import {
    HANDLERS,
    EPSILON,
    ELEMENTS,
    FIELDS,
    DEFAULTS,
    GRID_SIZE,
    FILL_STYLES,
    STROKES,
    DRAWING_THRESHOLD,
    DRAWING_OFFSET,
    TEXT_SIZE_MIN,
    TEXT_SIZE_STEP,
    TEXT_SIZE_MAX,
    TEXT_BOX_MIN_WIDTH,
    SHAPE_MIN_WIDTH,
    SHAPE_MIN_HEIGHT,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
    NOTE_MIN_WIDTH,
    NOTE_MIN_HEIGHT,
    BOOKMARK_WIDTH,
    BOOKMARK_HEIGHT,
    OPACITY_DEFAULT,
    STICKER_WIDTH,
    STICKER_HEIGHT,
    ARROW_SHAPES,
} from "../constants.js";
import {
    sign,
    hypotenuse,
    measureText,
    getPointDistanceToLine,
    getPointProjectionToLine,
    getPointInQuadraticCurve,
    getPointsBounds,
    getRectangleBounds,
} from "../utils/math.js";
import {getCurvePath, getConnectorPath} from "../utils/paths.js";
import {isCornerHandler} from "./handlers.js";

// Generate default handlers
const getDefaultElementHandlers = element => ([
    {
        type: HANDLERS.EDGE_TOP,
        x: (element.x1 + element.x2) / 2,
        y: element.y1,
    },
    {
        type: HANDLERS.EDGE_BOTTOM,
        x: (element.x1 + element.x2) / 2,
        y: element.y2,
    },
    {
        type: HANDLERS.EDGE_LEFT,
        x: element.x1,
        y: (element.y1 + element.y2) / 2,
    },
    {
        type: HANDLERS.EDGE_RIGHT,
        x: element.x2,
        y: (element.y1 + element.y2) / 2,
    },
    {
        type: HANDLERS.CORNER_TOP_LEFT,
        x: element.x1,
        y: element.y1,
    },
    {
        type: HANDLERS.CORNER_TOP_RIGHT,
        x: element.x2,
        y: element.y1,
    },
    {
        type: HANDLERS.CORNER_BOTTOM_LEFT,
        x: element.x1,
        y: element.y2,
    },
    {
        type: HANDLERS.CORNER_BOTTOM_RIGHT,
        x: element.x2,
        y: element.y2,
    },
]);

// Tiny utility to prevent having empty strokes
const checkStrokeStyleValue = initialValue => {
    return initialValue === STROKES.NONE ? STROKES.SOLID : initialValue;
};

// allow to perserve the aspect ratio of the element
const preserveAspectRatio = (element, snapshot, event) => {
    const ratio = (snapshot.y2 - snapshot.y1) / Math.max(1, snapshot.x2 - snapshot.x1);
    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
        if (event.dx * ratio < event.dy) {
            element.y1 = snapshot.y1 + ((element.x1 - snapshot.x1) * ratio);
        }
        else {
            element.x1 = snapshot.x1 + ((element.y1 - snapshot.y1) / ratio);
        }
    }
    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
        if ((-1) * event.dx * ratio < event.dy) {
            element.y1 = snapshot.y1 - ((element.x2 - snapshot.x2) * ratio);
        }
        else {
            element.x2 = snapshot.x2 - ((element.y1 - snapshot.y1) / ratio);
        }
    }
    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
        if ((-1) * event.dx * ratio > event.dy) {
            element.y2 = snapshot.y2 - ((element.x1 - snapshot.x1) * ratio);
        }
        else {
            element.x1 = snapshot.x1 - ((element.y2 - snapshot.y2) / ratio);
        }
    }
    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
        if (event.dx * ratio > event.dy) {
            element.y2 = snapshot.y2 + ((element.x2 - snapshot.x2) * ratio);
        }
        else {
            element.x2 = snapshot.x2 + ((element.y2 - snapshot.y2) / ratio);
        }
    }
    else if (event.handler === HANDLERS.EDGE_TOP) {
        element.x1 = snapshot.x1 + ((snapshot.x2 - snapshot.x1) / 2) - ((element.y2 - element.y1) / (2 * ratio));
        element.x2 = snapshot.x2 - ((snapshot.x2 - snapshot.x1) / 2) + ((element.y2 - element.y1) / (2 * ratio));
    }
    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
        element.x1 = snapshot.x1 + ((snapshot.x2 - snapshot.x1) / 2) - ((element.y2 - element.y1) / (2 * ratio));
        element.x2 = snapshot.x2 - ((snapshot.x2 - snapshot.x1) / 2) + ((element.y2 - element.y1) / (2 * ratio));
    }
    else if (event.handler === HANDLERS.EDGE_LEFT) {
        element.y1 = snapshot.y1 + ((snapshot.y2 - snapshot.y1) / 2) - ((element.x2 - element.x1) * ratio) / 2;
        element.y2 = snapshot.y2 - ((snapshot.y2 - snapshot.y1) / 2) + ((element.x2 - element.x1) * ratio) / 2;
    }
    else if (event.handler === HANDLERS.EDGE_RIGHT) {
        element.y1 = snapshot.y1 + ((snapshot.y2 - snapshot.y1) / 2) - ((element.x2 - element.x1) * ratio) / 2;
        element.y2 = snapshot.y2 - ((snapshot.y2 - snapshot.y1) / 2) + ((element.x2 - element.x1) * ratio) / 2;
    }
};

export const elementsConfig = {
    [ELEMENTS.SHAPE]: {
        displayName: "Shape",
        getHandlers: element => getDefaultElementHandlers(element),
        initialize: values => {
            // Prevent drawing a shape with stroke and fill styles as none
            let strokeStyle = values?.strokeStyle ?? DEFAULTS.STROKE_STYLE;
            if (values?.fillStyle === FILL_STYLES.NONE && values?.strokeStyle === STROKES.NONE) { 
                strokeStyle = DEFAULTS.STROKE_STYLE;
            }
            // Return 
            return {
                opacity: DEFAULTS.OPACITY,
                shape: values.shape || DEFAULTS.SHAPE,
                fillColor: values?.fillColor ?? DEFAULTS.FILL_COLOR,
                fillStyle: values?.fillStyle ?? DEFAULTS.FILL_STYLE,
                strokeColor: values?.strokeColor ?? DEFAULTS.STROKE_COLOR,
                strokeWidth: values?.strokeWidth ?? DEFAULTS.STROKE_WIDTH,
                strokeStyle: strokeStyle, // values?.strokeStyle ?? DEFAULTS.STROKE_STYLE,
                text: "",
                textColor: values?.textColor ?? DEFAULTS.TEXT_COLOR,
                textFont: values?.textFont ?? DEFAULTS.TEXT_FONT,
                textSize: values?.textSize ?? DEFAULTS.TEXT_SIZE,
                textAlign: values?.textAlign ?? DEFAULTS.TEXT_ALIGN,
                [FIELDS.TEXT_VERTICAL_ALIGN]: values?.[FIELDS.TEXT_VERTICAL_ALIGN] ?? DEFAULTS.TEXT_VERTICAL_ALIGN,
                textWidth: GRID_SIZE,
                textHeight: GRID_SIZE,
            };
        },
        onCreateMove: (element, event, getPosition) => {
            if (event.shiftKey) {
                const d = Math.max(Math.abs(event.dx), Math.abs(event.dy));
                element.x2 = getPosition(element.x1 + sign(event.dx) * d);
                element.y2 = getPosition(element.y1 + sign(event.dy) * d);
            }
        },
        onCreateEnd: (element, event) => {
            // Prevent drawing 0-sized shapes
            if (!event.drag) {
                element.x2 = element.x1 + SHAPE_MIN_WIDTH;
                element.y2 = element.y1 + SHAPE_MIN_HEIGHT;
            }
            // Update position of shape element
            Object.assign(element, {
                x1: Math.min(element.x1, element.x2),
                y1: Math.min(element.y1, element.y2),
                x2: Math.max(element.x1, element.x2),
                y2: Math.max(element.y1, element.y2),
            });
        },
        onResize: (element, snapshot, event) => {
            if (event.shiftKey) {
                preserveAspectRatio(element, snapshot, event);
            }
            // Check if we have a text inside the shape
            if (element.text) {
                const width = Math.abs(element.x2 - element.x1);
                const [textWidth, textHeight] = measureText(element.text || " ", element.textSize, element.textFont, width + "px");
                element.textWidth = textWidth;
                element.textHeight = textHeight;
            }
        },
        onUpdate: (element, changedKeys) => {
            if (element.text && (changedKeys.has("textFont") || changedKeys.has("textSize"))) {
                const width = Math.abs(element.x2 - element.x1);
                const [textWidth, textHeight] = measureText(element.text || " ", element.textSize, element.textFont, width + "px");
                element.textWidth = textWidth;
                element.textHeight = textHeight;
            }
        },
        getUpdatedFields: element => {
            return element.text ? ["textWidth", "textHeight"] : [];
        },
    },
    [ELEMENTS.ARROW]: {
        displayName: "Arrow",
        getHandlers: element => {
            const handlers = [
                {
                    type: HANDLERS.NODE_START,
                    x: element.x1,
                    y: element.y1,
                },
                {
                    type: HANDLERS.NODE_END,
                    x: element.x2,
                    y: element.y2,
                },
            ];
            // Note: this field may not exist in previously versions
            // In that case, we assume that the arrow type is a straight line and not a connector
            if (!element[FIELDS.ARROW_SHAPE] || element[FIELDS.ARROW_SHAPE] === ARROW_SHAPES.LINE) {
                handlers.splice(1, 0, {
                    type: HANDLERS.NODE_MIDDLE,
                    x: element.xCenter ?? ((element.x1 + element.x2) / 2),
                    y: element.yCenter ?? ((element.y1 + element.y2) / 2),
                });
            }
            return handlers;
        },
        getBounds: element => {
            const bounds = [];
            // 1. Check for connector arrow
            if (element[FIELDS.ARROW_SHAPE] === ARROW_SHAPES.CONNECTOR) {
                bounds.push({
                    path: getConnectorPath([[element.x1, element.y1], [element.x2, element.y2]]),
                });
            }
            // 2. Check for default arrow curve
            else {
                const center = (typeof element.xCenter === "number") ? [element.xCenter, element.yCenter] : null;
                // 2.1. Add default bound connecting the two nodes of the arrow
                bounds.push({
                    path: getCurvePath([[element.x1, element.y1], [element.x2, element.y2]], center),
                });
                // 2.2. Add lines to connect the control point with the start and end nodes
                if (center && !element.locked) {
                    bounds.push({
                        path: getCurvePath([[element.x1, element.y1], [element.xCenter, element.yCenter]]),
                        strokeDasharray: 5,
                    });
                    bounds.push({
                        path: getCurvePath([[element.x2, element.y2], [element.xCenter, element.yCenter]]),
                        strokeDasharray: 5,
                    });
                }
            }
            // 3. Return bounds
            return bounds;
        },
        getBoundingRectangle: el => {
            if (typeof el.xCenter === "number") {
                const points = [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9].map(t => {
                    return getPointInQuadraticCurve([el.x1, el.y1], [el.xCenter, el.yCenter], [el.x2, el.y2], t);
                });
                return getPointsBounds([[el.x1, el.y1], [el.x2, el.y2], ...points]);
            }
            return el;
        },
        getUpdatedFields: (element, snapshot) => {
            return ["xCenter", "yCenter"];
        },
        getSnapEdges: element => {
            return [
                {edge: SNAP_EDGE_X, x: element.x1, points: [[element.x1, element.y1]]},
                {edge: SNAP_EDGE_X, x: element.x2, points: [[element.x2, element.y2]]},
                {edge: SNAP_EDGE_Y, y: element.y1, points: [[element.x1, element.y1]]},
                {edge: SNAP_EDGE_Y, y: element.y2, points: [[element.x2, element.y2]]},
            ];
        },
        getSnapPoints: (element, snapEdge) => {
            if (snapEdge.edge === SNAP_EDGE_X) {
                return [(element.x1 === snapEdge.x ? [element.x1, element.y1] : [element.x2, element.y2])];
            }
            if (snapEdge.edge === SNAP_EDGE_Y) {
                return [(element.y1 === snapEdge.y ? [element.x1, element.y1] : [element.x2, element.y2])];
            }
        },
        initialize: values => {
            return {
                xCenter: null,
                yCenter: null,
                opacity: DEFAULTS.OPACITY,
                [FIELDS.ARROW_SHAPE]: values?.[FIELDS.ARROW_SHAPE] ?? DEFAULTS.ARROW_SHAPE,
                startArrowhead: values?.startArrowhead || DEFAULTS.ARROWHEAD_START,
                endArrowhead: values?.endArrowhead || DEFAULTS.ARROWHEAD_END,
                strokeColor: values?.strokeColor ?? DEFAULTS.STROKE_COLOR,
                strokeWidth: values?.strokeWidth ?? DEFAULTS.STROKE_WIDTH,
                strokeStyle: checkStrokeStyleValue(values?.strokeStyle ?? DEFAULTS.STROKE_STYLE),
            };
        },
        onCreateStart: (element, event) => {
            // with SHIFT key pressed, we only allow creating a line arrow
            // if (event.shiftKey) {
            //     element[FIELDS.ARROW_SHAPE] = ARROW_SHAPES.LINE;
            // }
        },
        onCreateMove: (element, event, getPosition) => {
            if (event.shiftKey) {
                const a = Math.PI / 12;
                const angle = Math.round(Math.atan2(event.dy, event.dx) / a) * a;
                const d = hypotenuse(event.dx, event.dy);
                element.x2 = getPosition(element.x1 + Math.cos(angle) * d);
                element.y2 = getPosition(element.y1 + Math.sin(angle) * d);
            }
        },
        onResizeStart: (element, snapshot, event) => {
            if (event.handler === HANDLERS.NODE_MIDDLE) {
                if (typeof snapshot.xCenter !== "number") {
                    snapshot.xCenter = (snapshot.x1 + snapshot.x2) / 2;
                    snapshot.yCenter = (snapshot.y1 + snapshot.y2) / 2;
                }
            }
        },
        onResize: (element, snapshot, event, getPosition) => {
            if (event.handler === HANDLERS.NODE_MIDDLE) {
                const x = getPosition(snapshot.xCenter + event.dx);
                const y = getPosition(snapshot.yCenter + event.dy);
                // Check to reset the position of the center
                if (getPointDistanceToLine([x, y], [[element.x1, element.y1], [element.x2, element.y2]]) < GRID_SIZE) {
                    const p = getPointProjectionToLine([x, y], [[element.x1, element.y1], [element.x2, element.y2]]);
                    element.xCenter = p[0];
                    element.yCenter = p[1];
                }
                else {
                    element.xCenter = x;
                    element.yCenter = y;
                }
            }
            else if (event.shiftKey && !element.xCenter) {
                const a = Math.PI / 12;
                const dx = element.x2 - element.x1;
                const dy = element.y2 - element.y1;
                const angle = Math.round(Math.atan2(dy, dx) / a) * a;
                const d = hypotenuse(dx, dy);
                if (event.handler === HANDLERS.NODE_END) {
                    element.x2 = getPosition(element.x1 + Math.cos(angle) * d);
                    element.y2 = getPosition(element.y1 + Math.sin(angle) * d);
                }   
                else {
                    element.x1 = getPosition(element.x2 - Math.cos(angle) * d);
                    element.y1 = getPosition(element.y2 - Math.sin(angle) * d);
                }
            }   
        },
        onResizeEnd: (element, snapshot, event) => {
            if (event.handler === HANDLERS.NODE_MIDDLE) {
                const center = [element.xCenter, element.yCenter];
                if (getPointDistanceToLine(center, [[element.x1, element.y1], [element.x2, element.y2]]) < GRID_SIZE) {
                    element.xCenter = null;
                    element.yCenter = null;
                }
            }
        },
        onDrag: (element, snapshot, event) => {
            if (typeof element.xCenter === "number") {
                element.xCenter = element.x1 + (snapshot.xCenter - snapshot.x1);
                element.yCenter = element.y1 + (snapshot.yCenter - snapshot.y1);
            }
        },
        onDuplicate: (element, dx = 0, dy = 0) => {
            if (typeof element.xCenter === "number" && typeof element.yCenter === "number") {
                element.xCenter = element.xCenter + dx;
                element.yCenter = element.yCenter + dy;
            }
        },
        isValueAllowed: (key, value) => {
            return !(key === FIELDS.STROKE_STYLE && value === STROKES.NONE);
        },
    },
    [ELEMENTS.TEXT]: {
        displayName: "Text",
        getHandlers: element => getDefaultElementHandlers(element),
        getUpdatedFields: (element, snapshot) => {
            return ["textSize", "textWidth", "textHeight"];
        },
        initialize: values => {
            // We need to measure the height of an empty text to calculate the height of the element
            const textSize = values?.textSize ?? DEFAULTS.TEXT_SIZE;
            const textFont = values?.textFont ?? DEFAULTS.TEXT_FONT;
            const [textWidth, textHeight] = measureText(" ", textSize, textFont);
            return ({
                opacity: DEFAULTS.OPACITY,
                text: "",
                textColor: values?.textColor ?? DEFAULTS.TEXT_COLOR,
                textFont: textFont,
                textSize: textSize,
                textAlign: values?.textAlign ?? DEFAULTS.TEXT_ALIGN,
                textWidth: GRID_SIZE,
                textHeight: textHeight, // Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE,
            });
        },
        onCreateMove: element => {
            element.y2 = element.y1 + element.textHeight;
        },
        onCreateEnd: element => {
            Object.assign(element, {
                x1: Math.min(element.x1, element.x2),
                y1: Math.min(element.y1, element.y2),
                x2: Math.max(element.x1, element.x2),
                y2: Math.max(element.y1, element.y2),
            });
            // Fix text initial X position
            const deltax = Math.abs(element.x2 - element.x1);
            if (deltax < (EPSILON / 2)) {
                element.x2 = element.x1 + TEXT_BOX_MIN_WIDTH;
            }
            else if (deltax < GRID_SIZE) {
                element.x2 = element.x1 + GRID_SIZE;
            }
            // Fix text initial Y position
            element.y2 = element.y1 + Math.max(Math.abs(element.y2 - element.y1), GRID_SIZE, Math.ceil(element.textHeight / GRID_SIZE) * GRID_SIZE);
        },
        onUpdate: (element, changedKeys) => {
            if (changedKeys.has("textSize") || changedKeys.has("textFont")) {
                const width = Math.abs(element.x2 - element.x1);
                const [textWidth, textHeight] = measureText(element.text || " ", element.textSize, element.textFont, width + "px");
                // Apply changes to element
                element.textWidth = textWidth;
                element.textHeight = textHeight;
                element.y2 = element.y1 + Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE;
            }
        },
        onResize: (element, snapshot, event) => {
            const handler = event.handler || "";
            if (isCornerHandler(handler) || handler === HANDLERS.EDGE_BOTTOM || handler === HANDLERS.EDGE_TOP) {
                preserveAspectRatio(element, snapshot, event);
                const width = Math.abs(element.x2 - element.x1);
                const height = Math.abs(element.y2 - element.y1);
                let textSize = TEXT_SIZE_MIN;
                while (textSize <= TEXT_SIZE_MAX) {
                    const size = measureText(element.text || " ", textSize, element.textFont, width + "px");
                    if (size[1] >= height) {
                        break;
                    }
                    element.textSize = textSize;
                    element.textWidth = size[0];
                    element.textHeight = size[1];
                    textSize = textSize + TEXT_SIZE_STEP;
                }
            }
            else if (handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.EDGE_RIGHT) {
                const width = Math.abs(element.x2 - element.x1);
                const sizes = measureText(element.text || " ", element.textSize, element.textFont, width + "px");
                element.textWidth = sizes[0];
                element.textHeight = sizes[1];
                element.y2 = element.y1 + element.textHeight; // fix height
            }
            // Terrible hack to prevent having 0px text elements
            if (handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.CORNER_TOP_LEFT || handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                element.x1 = Math.min(element.x1, element.x2 - element.textWidth);
            }
            else if (handler === HANDLERS.EDGE_RIGHT || handler === HANDLERS.CORNER_TOP_RIGHT || handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                element.x2 = Math.max(element.x2, element.x1 + element.textWidth);
            }
        },
    },
    [ELEMENTS.DRAW]: {
        displayName: "Drawing",
        getHandlers: element => getDefaultElementHandlers(element),
        initialize: values => {
            return {
                opacity: DEFAULTS.OPACITY,
                points: [],
                strokeColor: values?.strokeColor ?? DEFAULTS.STROKE_COLOR,
                strokeWidth: values?.strokeWidth ?? DEFAULTS.STROKE_WIDTH,
                strokeStyle: checkStrokeStyleValue(values?.strokeStyle ?? DEFAULTS.STROKE_STYLE),
                drawWidth: 0,
                drawHeight: 0,
            };
        },
        isValueAllowed: (key, value) => {
            return !(key === FIELDS.STROKE_STYLE && value === STROKES.NONE);
        },
        onCreateStart: (element, event) => {
            element.points.push([event.originalX - element.x1, event.originalY - element.y1]);
        },
        onCreateMove: (element, event) => {
            const lastPoint = element.points[element.points.length - 1];
            const newPointX = element.points[0][0] + event.dx;
            const newPointY = element.points[0][1] + event.dy;
            if (Math.abs(lastPoint[0] - newPointX) > DRAWING_THRESHOLD || Math.abs(lastPoint[1] - newPointY) > DRAWING_THRESHOLD) {
                element.points.push([newPointX, newPointY]);
            }
        },
        onCreateEnd: element => {
            const initialX = element.x1;
            const initialY = element.y1;
            // Calculate the min and max points increment
            const minX = Math.min.apply(null, element.points.map(point => point[0]));
            const maxX = Math.max.apply(null, element.points.map(point => point[0]));
            const minY = Math.min.apply(null, element.points.map(point => point[1]));
            const maxY = Math.max.apply(null, element.points.map(point => point[1]));
            // Update element position
            element.x1 = Math.floor((initialX + minX - DRAWING_OFFSET)); //  / GRID_SIZE) * GRID_SIZE;
            element.y1 = Math.floor((initialY + minY - DRAWING_OFFSET)) // / GRID_SIZE) * GRID_SIZE;
            element.x2 = Math.ceil((initialX + maxX + DRAWING_OFFSET)); // / GRID_SIZE) * GRID_SIZE;
            element.y2 = Math.ceil((initialY + maxY + DRAWING_OFFSET)); // / GRID_SIZE) * GRID_SIZE;
            // Simplify path and translate to (x1,y1)
            // element.points = simplifyPath(element.points, 0.5).map(point => {
            element.points = element.points.map(point => {
                return [
                    initialX - element.x1 + point[0],
                    initialY - element.y1 + point[1],
                ];
            });
            // Save drawing width and height
            element.drawWidth = Math.abs(element.x2 - element.x1);
            element.drawHeight = Math.abs(element.y2 - element.y1);
        },
        onResize: (element, snapshot, event) => {
            if (event.shiftKey) {
                return preserveAspectRatio(element, snapshot, event);
            }
        },
    },
    [ELEMENTS.IMAGE]: {
        displayName: "Image",
        getHandlers: element => getDefaultElementHandlers(element),
        initialize: () => ({
            [FIELDS.ASSET_ID]: "",
            [FIELDS.OPACITY]: DEFAULTS.OPACITY,
        }),
        onResize: (element, snapshot, event) => {
            if (event.shiftKey) {
                return preserveAspectRatio(element, snapshot, event);
            }
        },
    },
    [ELEMENTS.NOTE]: {
        displayName: "Note",
        getSnapEdges: () => [],
        initialize: values => ({
            [FIELDS.NOTE_COLOR]: values?.[FIELDS.NOTE_COLOR] ?? DEFAULTS.NOTE_COLOR,
            [FIELDS.NOTE_TEXT]: "",
        }),
        onCreateMove: element => {
            element.x1 = element.x2;
            element.y1 = element.y2;
        },
        onCreateEnd: element => {
            element.x1 = element.x1 - NOTE_MIN_WIDTH / 2;
            element.x2 = element.x2 + NOTE_MIN_WIDTH / 2;
            element.y1 = element.y1 - NOTE_MIN_HEIGHT / 2;
            element.y2 = element.y2 + NOTE_MIN_HEIGHT / 2;
        },
    },
    [ELEMENTS.BOOKMARK]: {
        displayName: "Bookmark",
        getSnapEdges: () => [],
        initialize: () => ({
            [FIELDS.ASSET_ID]: "",
            [FIELDS.OPACITY]: OPACITY_DEFAULT,
        }),
        onCreateEnd: element => {
            element.x1 = element.x1 - (BOOKMARK_WIDTH / 2);
            element.y1 = element.y1 - (BOOKMARK_HEIGHT / 2);
            element.x2 = element.x1 + BOOKMARK_WIDTH;
            element.y2 = element.y1 + BOOKMARK_HEIGHT;
        },
    },
    [ELEMENTS.STICKER]: {
        displayName: "Sticker",
        initialize: values => ({
            [FIELDS.STICKER]: values?.[FIELDS.STICKER] ?? DEFAULTS.STICKER,
            [FIELDS.OPACITY]: values?.[FIELDS.OPACITY] ?? DEFAULTS.OPACITY,
        }),
        onCreateMove: element => {
            element.x1 = element.x2;
            element.y1 = element.y2;
        },
        onCreateEnd: element => {
            element.x1 = element.x1 - STICKER_WIDTH / 2;
            element.x2 = element.x2 + STICKER_WIDTH / 2;
            element.y1 = element.y1 - STICKER_HEIGHT / 2;
            element.y2 = element.y2 + STICKER_HEIGHT / 2;
        },
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};

// Tiny utility to generate an element ID
export const generateElementId = () => {
    return `el::${uid(20)}`;
};

// Create a new element
export const createElement = elementType => {
    return {
        [FIELDS.VERSION]: 0,
        [FIELDS.TYPE]: elementType,
        [FIELDS.ID]: generateElementId(),
        [FIELDS.NAME]: "",
        [FIELDS.X_START]: 0,
        [FIELDS.Y_START]: 0,
        [FIELDS.X_END]: 0,
        [FIELDS.Y_END]: 0,
        [FIELDS.SELECTED]: false,
        [FIELDS.CREATING]: false,
        [FIELDS.EDITING]: false,
        [FIELDS.LOCKED]: false,
        [FIELDS.ORDER]: 0,
        [FIELDS.GROUP]: null,
    };
};

// @deprecated Please use createElement instead
export const createNewElement = elementType => {
    return createElement(elementType);
};

export const exportElementSvg = element => {
    return document.querySelector(`g[data-element="${element.id}"]`)?.cloneNode?.(true);
};

// @description Measure text with the configuration of the provided element
export const measureTextInElement = (element, text, maxWidth = `${TEXT_BOX_MIN_WIDTH}px`) => {
    return measureText(text || element.text || " ", element.textSize ?? 0, element.textFont ?? "", maxWidth);
};

// @public get snapping edges from elements
export const getElementsSnappingEdges = (elements) => {
    const edges = [];
    elements.forEach(el => {
        // Selected or creating elements are excluded
        if (el.selected || el.creating) {
            return;
        }
        let newEdges = [];
        // 1. Check if this funcition has a special function to obtain snap edges
        if (typeof elementsConfig[el.type].getSnapEdges === "function") {
            newEdges = elementsConfig[el.type].getSnapEdges(el);
        }
        // 2. If not, generate default snap edges
        else {
            const centerX = (el.x1 + el.x2) / 2;
            const centerY = (el.y1 + el.y2) / 2;
            newEdges = [
                {edge: SNAP_EDGE_X, x: el.x1, points: [[el.x1, el.y1], [el.x1, el.y2]]},
                {edge: SNAP_EDGE_X, x: el.x2, points: [[el.x2, el.y1], [el.x2, el.y2]]},
                {edge: SNAP_EDGE_Y, y: el.y1, points: [[el.x1, el.y1], [el.x2, el.y1]]},
                {edge: SNAP_EDGE_Y, y: el.y2, points: [[el.x1, el.y2], [el.x2, el.y2]]},
                {edge: SNAP_EDGE_X, x: centerX, points: [[centerX, centerY]]},
                {edge: SNAP_EDGE_Y, y: centerY, points: [[centerX, centerY]]},
            ];
        }
        // 3. Merge new edges with the current added edges
        newEdges.forEach(item => {
            const edge = edges.find(e => e.edge === item.edge && e[e.edge] === item[e.edge]);
            if (edge) {
                edge.points = [...edge.points, ...item.points];
            }
            // No edge found, so just insert it in the list of output edges
            else {
                edges.push(item);
            }
        });
    });
    return edges;
};

// @public get snapping points from provided element and snap edge
export const getElementSnappingPoints = (element, snapEdge) => {
    if (element?.type) {
        if (typeof elementsConfig[element.type].getSnapPoints === "function") {
            return elementsConfig[element.type].getSnapPoints(element, snapEdge);
        }
    }
    // Other case, return default points
    if (snapEdge.edge === SNAP_EDGE_X) {
        return [
            [snapEdge.x, element.y1],
            [snapEdge.x, element.y2],
        ];
    }
    if (snapEdge.edge === SNAP_EDGE_Y) {
        return [
            [element.x1, snapEdge.y],
            [element.x2, snapEdge.y],
        ];
    }
    // wat?
    return [];
};

// @public generate display name for the provided element
export const getElementDisplayName = element => {
    return getElementConfig(element).displayName;
};

// @public get the bounds of the provided elements
export const getElementsBounds = (elements = []) => {
    return getRectangleBounds(elements.map(el => {
        const elementConfig = getElementConfig(el);
        if (typeof elementConfig.getBoundingRectangle === "function") {
            return elementConfig.getBoundingRectangle(el);
        }
        return el;
    }));
};
