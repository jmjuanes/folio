import React from "react";
import {getRectangleBounds} from "../../utils/index.js";

export const Bounds = props => {
    const offset = props.offset / props.zoom;
    const bound = getRectangleBounds(props.elements);

    return (
        <React.Fragment>
            <rect
                x={bound.x1 - offset}
                y={bound.y1 - offset}
                width={Math.abs(bound.x2 - bound.x1) + 2 * offset}
                height={Math.abs(bound.y2 - bound.y1) + 2 * offset}
                fill={props.fillColor}
                stroke={props.strokeColor}
                strokeWidth={props.strokeWidth / props.zoom}
                onPointerDown={props.onPointerDown}
            />
        </React.Fragment>
    );
};

Bounds.defaultProps = {
    elements: [],
    offset: 4,
    fillColor: "transparent",
    fillOpacity: "0.2",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    zoom: 1,
    onPointerDown: null,
};
