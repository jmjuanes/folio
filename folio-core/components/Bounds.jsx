import React from "react";
import {CURSORS, LIGHT_BLUE, TRANSPARENT} from "../constants.js";

export const Bounds = props => {
    const offset = props.offset / props.zoom;
    return (
        <rect
            x={props.position.x1 - offset}
            y={props.position.y1 - offset}
            width={Math.abs(props.position.x2 - props.position.x1) + 2 * offset}
            height={Math.abs(props.position.y2 - props.position.y1) + 2 * offset}
            fill={props.fillColor}
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth / props.zoom}
            strokeDasharray={(props.strokeDasharray / props.zoom)}
            strokeDashoffset={props.strokeDashoffset}
            style={props.style}
            onPointerDown={props.onPointerDown}
        />
    );
};

Bounds.defaultProps = {
    position: null,
    offset: 0,
    fillColor: TRANSPARENT,
    // fillOpacity: "0.2",
    strokeColor: LIGHT_BLUE,
    strokeWidth: 2,
    strokeDasharray: 0,
    strokeDashoffset: null,
    style: {
        cursor: CURSORS.MOVE,
    },
    zoom: 1,
    onPointerDown: null,
};
