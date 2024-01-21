import React from "react";
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
    SHAPE_PADDING,
    NOTE_MIN_WIDTH,
    NOTE_MIN_HEIGHT,
} from "@lib/constants.js";
import {
    measureText,
    getPointDistanceToLine,
    getPointProjectionToLine,
} from "@lib/utils/math.js";
import {getCurvePath} from "@lib/utils/paths.js";
import {SvgContainer} from "@components/commons/svg.jsx";
import {isCornerHandler} from "@components/render/handlers.jsx";

import {ArrowElement} from "./basic/arrow.jsx";
import {DrawElement} from "./basic/draw.jsx";
import {TextElement} from "./basic/text.jsx";
import {ShapeElement} from "./basic/shape.jsx";
import {ImageElement} from "./basic/image.jsx";
import {NoteElement} from "./basic/note.jsx";

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

const ElementContainer = props => (
    <SvgContainer>
        <g data-role="element" data-element={props.id}>
            {props.children}
        </g>
    </SvgContainer>
);

// Tiny utility to prevent having empty strokes
const checkStrokeStyleValue = initialValue => {
    return initialValue === STROKES.NONE ? STROKES.SOLID : initialValue;
};

export const elementsConfig = {
    [ELEMENTS.SHAPE]: {
        render: props => (
            <ElementContainer id={props.id}>
                <ShapeElement {...props} />
                <TextElement
                    {...props}
                    embedded={true}
                    padding={SHAPE_PADDING}
                />
            </ElementContainer>
        ),
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
                textWidth: GRID_SIZE,
                textHeight: GRID_SIZE,
            };
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
        onUpdate: (element, changedKeys) => {
            if (element.text && (changedKeys.has("textFont") || changedKeys.has("textSize"))) {
                const [textWidth, textHeight] = measureText(element.text || " ", element.textSize, element.textFont);
                element.textWidth = textWidth;
                element.textHeight = textHeight;
            }
        },
    },
    [ELEMENTS.ARROW]: {
        render: props => (
            <ElementContainer id={props.id}>
                <ArrowElement {...props} />
            </ElementContainer>
        ),
        getHandlers: element => ([
            {
                type: HANDLERS.NODE_START,
                x: element.x1,
                y: element.y1,
            },
            {
                type: HANDLERS.NODE_MIDDLE,
                x: element.xCenter ?? ((element.x1 + element.x2) / 2),
                y: element.yCenter ?? ((element.y1 + element.y2) / 2),
            },
            {
                type: HANDLERS.NODE_END,
                x: element.x2,
                y: element.y2,
            }
        ]),
        getBounds: element => {
            const bounds = [];
            const center = (typeof element.xCenter === "number") ? [element.xCenter, element.yCenter] : null;
            // 1. Add default bound connecting the two nodes of the arrow
            bounds.push({
                path: getCurvePath([[element.x1, element.y1], [element.x2, element.y2]], center),
            });
            // 2. Add lines to connect the control point with the start and end nodes
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
            // 3. Return bounds
            return bounds;
        },
        getUpdatedFields: (element, snapshot) => {
            return ["xCenter", "yCenter"];
        },
        initialize: values => {
            return {
                xCenter: null,
                yCenter: null,
                opacity: DEFAULTS.OPACITY,
                startArrowhead: values?.startArrowhead || DEFAULTS.ARROWHEAD_START,
                endArrowhead: values?.endArrowhead || DEFAULTS.ARROWHEAD_END,
                strokeColor: values?.strokeColor ?? DEFAULTS.STROKE_COLOR,
                strokeWidth: values?.strokeWidth ?? DEFAULTS.STROKE_WIDTH,
                strokeStyle: checkStrokeStyleValue(values?.strokeStyle ?? DEFAULTS.STROKE_STYLE),
            };
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
        isValueAllowed: (key, value) => {
            return !(key === FIELDS.STROKE_STYLE && value === STROKES.NONE);
        },
    },
    [ELEMENTS.TEXT]: {
        render: props => (
            <ElementContainer id={props.id}>
                <TextElement {...props} />
            </ElementContainer>
        ),
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
            const width = Math.abs(element.x2 - element.x1);
            const height = Math.abs(element.y2 - element.y1);
            if (isCornerHandler(handler) || handler === HANDLERS.EDGE_BOTTOM || handler === HANDLERS.EDGE_TOP) {
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
                // Terrible hack to prevent having 0px text elements
                if (handler === HANDLERS.EDGE_BOTTOM || handler === HANDLERS.CORNER_BOTTOM_LEFT || handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                    element.y2 = element.y1 + Math.max(height, element.textHeight, GRID_SIZE);
                }
                else {
                    element.y1 = element.y2 - Math.max(height, element.textHeight, GRID_SIZE);
                }
            }
            else if (handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.EDGE_RIGHT) {
                const sizes = measureText(element.text || " ", element.textSize, element.textFont, width + "px");
                element.textWidth = sizes[0];
                element.textHeight = sizes[1];
                element.y1 = snapshot.y1;
                element.y2 = element.y1 + Math.ceil(sizes[1] / GRID_SIZE) * GRID_SIZE;
            }
            // Terrible hack to prevent having 0px text elements
            if (handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.CORNER_TOP_LEFT || handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                element.x1 = Math.min(element.x1, element.x2 - element.textWidth);
            }
            else if (handler === HANDLERS.EDGE_RIGHT || handler === HANDLERS.CORNER_TOP_RIGHT || handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                element.x2 = Math.max(element.x2, element.x1 + element.textWidth);
            }
        },
        utils: {
            measureText: (text, textSize, textFont, maxWidth) => {
                return measureText(text || " ", textSize, textFont, maxWidth);
            },
        },
    },
    [ELEMENTS.DRAW]: {
        render: props => (
            <ElementContainer id={props.id}>
                <DrawElement {...props} />
            </ElementContainer>    
        ),
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
            element.x1 = Math.floor((initialX + minX - DRAWING_OFFSET) / GRID_SIZE) * GRID_SIZE;
            element.y1 = Math.floor((initialY + minY - DRAWING_OFFSET) / GRID_SIZE) * GRID_SIZE;
            element.x2 = Math.ceil((initialX + maxX + DRAWING_OFFSET) / GRID_SIZE) * GRID_SIZE;
            element.y2 = Math.ceil((initialY + maxY + DRAWING_OFFSET) / GRID_SIZE) * GRID_SIZE;
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
    },
    [ELEMENTS.IMAGE]: {
        render: props => (
            <ElementContainer id={props.id}>
                <ImageElement {...props} />
            </ElementContainer>
        ),
        getHandlers: element => getDefaultElementHandlers(element),
        initialize: () => ({
            assetId: "",
            opacity: DEFAULTS.OPACITY,
            imageWidth: 0,
            imageHeight: 0,
        }),
    },
    [ELEMENTS.NOTE]: {
        render: props => (
            <ElementContainer id={props.id}>
                <NoteElement {...props} />
            </ElementContainer>
        ),
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
        type: elementType,
        id: generateElementId(),
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        minWidth: 1,
        minHeight: 1,
        selected: false,
        creating: false,
        editing: false,
        [FIELDS.LOCKED]: false,
        [FIELDS.ORDER]: 0,
    };
};

export const createNewElement = elementType => {
    return createElement(elementType);
};

export const exportElementSvg = elementId => {
    return document.querySelector(`g[data-element="${elementId}"]`)?.cloneNode?.(true);
};
