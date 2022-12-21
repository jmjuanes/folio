import React from "react";
import {
    ELEMENTS,
    GRID_SIZE,
    SHAPES,
    ARROWHEADS,
} from "./constants";
import {ArrowElement} from "./components/Elements/ArrowElement.jsx";
import {DrawElement} from "./components/Elements/DrawElement.jsx";
import {TextElement} from "./components/Elements/TextElement.jsx";
import {ShapeElement} from "./components/Elements/ShapeElement.jsx";
import {ImageElement} from "./components/Elements/ImageElement.jsx";
import {simplifyPath} from "./utils/index.js";

export const elementsConfig = {
    [ELEMENTS.SHAPE]: {
        render: props => (
            <React.Fragment>
                <ShapeElement {...props} />
                <TextElement {...props} />
            </React.Fragment>
        ),
        initialize: values => ({
            shape: values.shape || SHAPES.RECTANGLE,
            edgeHandlers: true,
            cornerHandlers: true,
            fillColor: values.fillColor,
            fillOpacity: values.fillOpacity,
            strokeColor: values.strokeColor,
            strokeWidth: values.strokeWidth,
            strokeStyle: values.strokeStyle,
            strokeOpacity: values.strokeOpacity,
            text: "",
            textColor: values.textColor,
            textFont: values.textFont,
            textSize: values.textSize,
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
            startArrowhead: values.startArrowhead || ARROWHEADS.NONE,
            endArrowhead: values.endArrowhead || ARROWHEADS.NONE,
            strokeColor: values.strokeColor,
            strokeWidth: values.strokeWidth,
            strokeStyle: values.strokeStyle,
            strokeOpacity: values.strokeOpacity,
        }),
    },
    [ELEMENTS.TEXT]: {
        render: props => <TextElement {...props} />,
        initialize: styles => ({
            edgeHandlers: true,
            cornerHandlers: true,
            text: "",
            textColor: styles.textColor,
            textFont: styles.textFont,
            textSize: styles.textSize,
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
    [ELEMENTS.DRAW]: {
        render: props => <DrawElement {...props} />,
        initialize: styles => ({
            points: [],
            strokeColor: styles.strokeColor,
            strokeWidth: styles.strokeWidth,
            strokeStyle: styles.strokeStyle,
            strokeOpacity: styles.strokeOpacity,
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
            image: "",
            imageWidth: 0,
            imageHeight: 0,
        }),
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};
