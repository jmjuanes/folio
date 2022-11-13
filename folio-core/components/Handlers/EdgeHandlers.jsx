import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";

export const EdgeHandlers = props => {
    const width = props.points[1][0] - props.points[0][0];
    const height = props.points[2][1] - props.points[1][1];
    const size = props.size / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g fill="transparent">
            <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
                <line
                    x1={props.points[0][0]}
                    x2={props.points[1][0]}
                    y1={props.points[0][1]}
                    y2={props.points[1][1]}
                />
                <line
                    x1={props.points[1][0]}
                    x2={props.points[2][0]}
                    y1={props.points[1][1]}
                    y2={props.points[2][1]}
                />
                <line
                    x1={props.points[2][0]}
                    x2={props.points[3][0]}
                    y1={props.points[2][1]}
                    y2={props.points[3][1]}
                />
                <line
                    x1={props.points[3][0]}
                    x2={props.points[0][0]}
                    y1={props.points[3][1]}
                    y2={props.points[0][1]}
                />
            </g>
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_TOP}
                x={props.points[0][0]}
                y={props.points[0][1] - size / 2}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_BOTTOM}
                x={props.points[3][0]}
                y={props.points[3][1]}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_LEFT}
                x={props.points[0][0] - size / 2}
                y={props.points[0][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_RIGHT}
                x={props.points[1][0]}
                y={props.points[1][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
            />
        </g>
    );
};

EdgeHandlers.defaultProps = {
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    size: 12,
    points: [],
    zoom: 1,
};
