import React from "react";

export const Brush = props => (
    <rect
        x={Math.min(props.x, props.x + props.width)}
        y={Math.min(props.y, props.y + props.height)}
        width={Math.abs(props.width)}
        height={Math.abs(props.height)}
        fill={props.fillColor}
        fillOpacity={props.fillOpacity}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth}
        strokeDasharray={props.strokeDash}
    />
);

Brush.defaultProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fillColor: "#fff",
    fillOpacity: "0.1",
    strokeWidth: "2px",
    strokeDash: "5 5",
};
