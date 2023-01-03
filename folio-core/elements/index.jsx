import React from "react";
import {
    ELEMENTS,
    GRID_SIZE,
    DEFAULT_ARROWHEAD_END,
    DEFAULT_ARROWHEAD_START,
    DEFAULT_FILL_COLOR,
    DEFAULT_FILL_OPACITY,
    DEFAULT_SHAPE,
    DEFAULT_STROKE_COLOR,
    DEFAULT_STROKE_OPACITY,
    DEFAULT_STROKE_STYLE,
    DEFAULT_STROKE_WIDTH,
    DEFAULT_TEXT_COLOR,
    DEFAULT_TEXT_FONT,
    DEFAULT_TEXT_SIZE,
} from "../constants";
import {ArrowElement} from "./ArrowElement.jsx";
import {DrawElement} from "./DrawElement.jsx";
import {TextElement} from "./TextElement.jsx";
import {ShapeElement} from "./ShapeElement.jsx";
import {ImageElement} from "./ImageElement.jsx";
import {simplifyPath} from "../math.js";

export const elementsConfig = {
    [ELEMENTS.SHAPE]: {
        render: props => (
            <React.Fragment>
                <ShapeElement {...props} />
                <TextElement embedded={true} {...props} />
            </React.Fragment>
        ),
        initialize: values => ({
            shape: values.shape || DEFAULT_SHAPE,
            edgeHandlers: true,
            cornerHandlers: true,
            fillColor: values?.fillColor ?? DEFAULT_FILL_COLOR,
            fillOpacity: values?.fillOpacity ?? DEFAULT_FILL_OPACITY,
            strokeColor: values?.strokeColor ?? DEFAULT_STROKE_COLOR,
            strokeWidth: values?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
            strokeStyle: values?.strokeStyle ?? DEFAULT_STROKE_STYLE,
            strokeOpacity: values?.strokeOpacity ?? DEFAULT_STROKE_OPACITY,
            text: "",
            textColor: values?.textColor ?? DEFAULT_TEXT_COLOR,
            textFont: values?.textFont ?? DEFAULT_TEXT_FONT,
            textSize: values?.textSize ?? DEFAULT_TEXT_SIZE,
            textAlign: "",
            textWidth: GRID_SIZE,
            textHeight: GRID_SIZE,
        }),
        onCreateEnd: element => {
            Object.assign(element, {
                x1: Math.min(element.x1, element.x2),
                y1: Math.min(element.y1, element.y2),
                x2: Math.max(element.x1, element.x2),
                y2: Math.max(element.y1, element.y2),
            });
        },
    },
    [ELEMENTS.ARROW]: {
        render: props => <ArrowElement {...props} />,
        initialize: values => ({
            nodeHandlers: true,
            startArrowhead: values?.startArrowhead || DEFAULT_ARROWHEAD_START,
            endArrowhead: values?.endArrowhead || DEFAULT_ARROWHEAD_END,
            strokeColor: values?.strokeColor ?? DEFAULT_STROKE_COLOR,
            strokeWidth: values?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
            strokeStyle: values?.strokeStyle ?? DEFAULT_STROKE_STYLE,
            strokeOpacity: values?.strokeOpacity ?? DEFAULT_STROKE_OPACITY,
        }),
    },
    [ELEMENTS.TEXT]: {
        render: props => <TextElement {...props} />,
        initialize: values => ({
            edgeHandlers: true,
            cornerHandlers: true,
            text: "",
            textColor: values?.textColor ?? DEFAULT_TEXT_COLOR,
            textFont: values?.textFont ?? DEFAULT_TEXT_FONT,
            textSize: values?.textSize ?? DEFAULT_TEXT_SIZE,
            textAlign: "",
            textWidth: GRID_SIZE,
            textHeight: GRID_SIZE,
            minWidth: GRID_SIZE,
            minHeight: GRID_SIZE,
        }),
        onCreateEnd: element => {
            Object.assign(element, {
                x1: Math.min(element.x1, element.x2),
                y1: Math.min(element.y1, element.y2),
                x2: Math.max(element.x1, element.x2),
                y2: Math.max(element.y1, element.y2),
            });
            // Fix text initial position
            if (Math.abs(element.x2 - element.x1) < GRID_SIZE) {
                element.x2 = element.x1 + GRID_SIZE;
            }
            if (Math.abs(element.y2 - element.y1) < GRID_SIZE) {
                element.y2 = element.y1 + GRID_SIZE;
            }
        },
    },
    [ELEMENTS.DRAW]: {
        render: props => <DrawElement {...props} />,
        initialize: values => ({
            points: [],
            strokeColor: values?.strokeColor ?? DEFAULT_STROKE_COLOR,
            strokeWidth: values?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
            strokeStyle: values?.strokeStyle ?? DEFAULT_STROKE_STYLE,
            strokeOpacity: values?.strokeOpacity ?? DEFAULT_STROKE_OPACITY,
        }),
        onCreateStart: element => {
            element.points.push([0, 0]);
        },
        onCreateMove: (element, event) => {
            element.points.push([event.dx, event.dy]);
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
            element.x1 = Math.floor((initialX + minX) / GRID_SIZE) * GRID_SIZE;
            element.y1 = Math.floor((initialY + minY) / GRID_SIZE) * GRID_SIZE;
            element.x2 = Math.ceil((initialX + maxX) / GRID_SIZE) * GRID_SIZE;
            element.y2 = Math.ceil((initialY + maxY) / GRID_SIZE) * GRID_SIZE;
            // Simplify path and translate to (x1,y1)
            element.points = simplifyPath(element.points, 0.5).map(point => {
                return [
                    point[0] - element.x1 + initialX,
                    point[1] - element.y1 + initialY,
                ];
            });
        },
    },
    [ELEMENTS.IMAGE]: {
        render: props => <ImageElement {...props} />,
        initialize: () => ({
            edgeHandlers: true,
            cornerHandlers: true,
            assetId: "",
            // image: "",
            imageWidth: 0,
            imageHeight: 0,
        }),
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};
