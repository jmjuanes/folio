import React from "react";
import {ELEMENTS} from "./constants";
import {RectangleElement} from "./components/Elements/RectangleElement.jsx";
import {EllipseElement} from "./components/Elements/EllipseElement.jsx";
import {LineElement} from "./components/Elements/LineElement.jsx";

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
        initialize: () => ({
            nodeHandlers: true,
            strokeColor: styles.strokeColor,
            strokeWidth: styles.strokeWidth,
            strokeStyle: styles.strokeStyle,
            strokeOpacity: styles.strokeOpacity,
        }),
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};
