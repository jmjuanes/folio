import React from "react";

export const Brush = props => (
    <rect
        x={Math.min(props.points[0][0], props.points[1][0])}
        y={Math.min(props.points[0][1], props.points[1][1])}
        width={Math.abs(props.points[0][0] - props.points[1][0])}
        height={Math.abs(props.points[0][1] - props.points[1][1])}
        fill={props.fillColor}
        fillOpacity={props.fillOpacity}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth}
        strokeDasharray={props.strokeDash}
    />
);

Brush.defaultProps = {
    points: [],
    fillColor: "#0d6efd",
    fillOpacity: "0.1",
    strokeColor: "#0d6efd",
    strokeWidth: "2px",
    strokeDash: "5 5",
};
