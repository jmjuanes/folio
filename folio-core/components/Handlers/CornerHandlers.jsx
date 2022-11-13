import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";

export const CornerHandlers = props => {
    const width = props.width / props.zoom;
    const height = props.height / props.zoom;
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g fill={props.fillColor} stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_TOP_LEFT}
                x={props.points[0][0] - width / 2}
                y={props.points[0][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_TOP_RIGHT}
                x={props.points[1][0] - width / 2}
                y={props.points[1][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_BOTTOM_RIGHT}
                x={props.points[2][0] - width / 2}
                y={props.points[2][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_BOTTOM_LEFT}
                x={props.points[3][0] - width / 2}
                y={props.points[3][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
            />
        </g>
    );
};

CornerHandlers.defaultProps = {
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    width: 12,
    height: 12,
    radius: 3,
    zoom: 1,
};
