import React from "react";

export const Brush = props => (
    <rect
        x={Math.min(props.position.x1, props.position.x2)}
        y={Math.min(props.position.y1, props.position.y2)}
        width={Math.abs(props.position.x2 - props.position.x1)}
        height={Math.abs(props.position.y2 - props.position.y1)}
        fill={props.fillColor}
        fillOpacity={props.fillOpacity}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth}
        strokeDasharray={props.strokeDash}
    />
);

Brush.defaultProps = {
    position: null,
    fillColor: "#0d6efd",
    fillOpacity: 0.1,
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    strokeDash: "5 5",
};
