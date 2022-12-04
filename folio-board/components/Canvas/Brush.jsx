import React from "react";

export const Brush = props => (
    <rect
        x={Math.min(props.x1, props.x2)}
        y={Math.min(props.y1, props.y2)}
        width={Math.abs(props.x2 - props.x1)}
        height={Math.abs(props.y2 - props.y1)}
        fill={props.fillColor}
        fillOpacity={props.fillOpacity}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth}
        strokeDasharray={props.strokeDash}
    />
);

Brush.defaultProps = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    fillColor: "#0d6efd",
    fillOpacity: 0.1,
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    strokeDash: "5 5",
};
