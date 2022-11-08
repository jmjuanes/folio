import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";

export const EdgeHandlers = props => {
    const width = props.points[1][0] - props.points[0][0];
    const height = props.points[2][1] - props.points[1][1];

    return (
        <g fill="transparent">
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_TOP}
                x={props.points[0][0]}
                y={props.points[0][1] - 2 * props.padding}
                width={width}
                height={2 * props.padding}
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
                height={2 * props.padding}
                style={{
                    cursor: "ns-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_LEFT}
                x={props.points[0][0] - 2 * props.padding}
                y={props.points[0][1]}
                width={2 * props.padding}
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
                width={2 * props.padding}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
            />
        </g>
    );
};

EdgeHandlers.defaultProps = {
    padding: 5,
    points: [],
};
