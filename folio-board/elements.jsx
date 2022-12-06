import React from "react";
import {ELEMENTS, GRID_SIZE} from "./constants";
import {RectangleElement} from "./components/Elements/RectangleElement.jsx";
import {EllipseElement} from "./components/Elements/EllipseElement.jsx";
import {LineElement} from "./components/Elements/LineElement.jsx";
import {DrawElement} from "./components/Elements/DrawElement.jsx";
import {simplifyPath} from "./utils/index.js";

export const elementsConfig = {
    [ELEMENTS.RECTANGLE]: {
        render: props => (
            <g key={props.id} data-element-id={props.id}>
                <RectangleElement {...props} />
            </g>
        ),
        initialize: styles => ({
            edgeHandlers: true,
            cornerHandlers: true,
            fillColor: styles.fillColor,
            fillOpacity: styles.fillOpacity,
            strokeColor: styles.strokeColor,
            strokeWidth: styles.strokeWidth,
            strokeStyle: styles.strokeStyle,
            strokeOpacity: styles.strokeOpacity,
            text: "",
            textColor: styles.textColor,
            textFont: styles.textFont,
            textSize: styles.textSize,
        }),
    },
    [ELEMENTS.ELLIPSE]: {
        render: props => (
            <g key={props.id} data-element-id={props.id}>
                <EllipseElement {...props} />
            </g>
        ),
        initialize: styles => ({
            edgeHandlers: true,
            cornerHandlers: true,
            fillColor: styles.fillColor,
            fillOpacity: styles.fillOpacity,
            strokeColor: styles.strokeColor,
            strokeWidth: styles.strokeWidth,
            strokeStyle: styles.strokeStyle,
            strokeOpacity: styles.strokeOpacity,
            text: "",
            textColor: styles.textColor,
            textFont: styles.textFont,
            textSize: styles.textSize,
        }),
    },
    [ELEMENTS.LINE]: {
        render: props => (
            <g key={props.id} data-element-id={props.id}>
                <LineElement {...props} />
            </g>
        ),
        initialize: styles => ({
            nodeHandlers: true,
            strokeColor: styles.strokeColor,
            strokeWidth: styles.strokeWidth,
            strokeStyle: styles.strokeStyle,
            strokeOpacity: styles.strokeOpacity,
        }),
    },
    [ELEMENTS.DRAW]: {
        render: props => (
            <g key={props.id} data-element-id={props.id}>
                <DrawElement {...props} />
            </g>
        ),
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
        onCreateMove: (element, info) => {
            element.push([event.dx, event.dy]);
        },
        onCreateEnd: element => {
            // Calculate the min and max points increment
            const minX = Math.min.apply(null, element.points.map(point => point[0]));
            const maxX = Math.max.apply(null, element.points.map(point => point[0]));
            const minY = Math.min.apply(null, element.points.map(point => point[1]));
            const maxY = Math.max.apply(null, element.points.map(point => point[1]));
            // Update element position
            element.x1 = Math.floor((element.x1 - minX) / GRID_SIZE) * GRID_SIZE;
            element.y1 = Math.floor((element.y1 - minY) / GRID_SIZE) * GRID_SIZE;
            element.x2 = Math.ceil((element.x1 + maxX) / GRID_SIZE) * GRID_SIZE;
            element.y2 = Math.ceil((element.y1 + maxY) / GRID_SIZE) * GRID_SIZE;
            // Simplify path and translate to (x1,y1)
            element.points = simplifyPath(element.points, 0.5).map(point => {
                return [point[0] + minX, point[1] + minY];
            });
        },
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};
