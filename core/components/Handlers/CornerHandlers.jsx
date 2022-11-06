import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";

export const CornerHandlers = props => (
    <g fill="#fff" stroke={props.color} strokeWidth="1">
        <rect
            data-type={POINT_SOURCES.HANDLER}
            data-value={HANDLERS.CORNER_TOP_LEFT}
            x={props.points[0][0] - props.size}
            y={props.points[0][1] - props.size}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nwse-resize",
            }}
        />
        <rect
            data-type={POINT_SOURCES.HANDLER}
            data-value={HANDLERS.CORNER_TOP_RIGHT}
            x={props.points[1][0]}
            y={props.points[1][1] - props.size}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nesw-resize",
            }}
        />
        <rect
            data-type={POINT_SOURCES.HANDLER}
            data-value={HANDLERS.CORNER_BOTTOM_RIGHT}
            x={props.points[2][0]}
            y={props.points[2][1]}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nwse-resize",
            }}
        />
        <rect
            data-type={POINT_SOURCES.HANDLER}
            data-value={HANDLERS.CORNER_BOTTOM_LEFT}
            x={props.points[3][0] - props.size}
            y={props.points[3][1]}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nesw-resize",
            }}
        />
    </g>
);

CornerHandlers.defaultProps = {
    color: "",
    size: 10,
};
