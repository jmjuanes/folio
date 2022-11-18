import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";

export const PointHandlers = props => {
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <line
                x1={props.points[0][0]}
                y1={props.points[0][1]}
                x2={props.points[1][0]}
                y2={props.points[1][1]}
                fill="none"
            />
            <circle
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.POINT_START}
                cx={props.points[0][0]}
                cy={props.points[0][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
            <circle
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.POINT_END}
                cx={props.points[1][0]}
                cy={props.points[1][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
        </g>
    );
};

PointHandlers.defaultProps = {
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    radius: 6,
    points: [],
    zoom: 1,
};
