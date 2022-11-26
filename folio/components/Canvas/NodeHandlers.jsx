import React from "react";
import {HANDLERS, HANDLERS_TYPES, POINT_SOURCES} from "../../constants.js";
import {useBoundaryPoints} from "../../hooks/useBoundaryPoints.js";

export const NodeHandlers = props => {
    // const selectedElements = props.elements.filter(el => !!el.selected);
    // Node handlers will be visible only for one selected elements
    if (props.elements.length !== 1) {
        return null;
    }
    // const points = props.elements.points || [];
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <line
                x1={props.elements[0].points[0][0]}
                y1={props.elements[0].points[0][1]}
                x2={props.elements[0].points[1][0]}
                y2={props.elements[0].points[1][1]}
                fill="none"
            />
            <circle
                data-handler="0"
                cx={props.elements[0].points[0][0]}
                cy={props.elements[0].points[0][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
            <circle
                data-handler="1"
                cx={props.elements[0].points[1][0]}
                cy={props.elements[0].points[1][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
        </g>
    );
};

NodeHandlers.defaultProps = {
    elements: [],
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    radius: 6,
    zoom: 1,
};
