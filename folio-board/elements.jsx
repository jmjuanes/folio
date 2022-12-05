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
        initialize: () => ({
            edgeHandlers: true,
            cornerHandlers: true,
            text: "",
        }),
    },
    [ELEMENTS.ELLIPSE]: {
        render: props => (
            <g key={props.id} data-element-id={props.id}>
                <EllipseElement {...props} />
            </g>
        ),
        initialize: () => ({
            edgeHandlers: true,
            cornerHandlers: true,
            text: "",
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
        }),
    },
};

export const getElementConfig = element => {
    return elementsConfig[element.type];
};
