import React from "react";
import {LineToolIcon} from "../components/icons/index.jsx";
import {getBalancedDash, getPointsDistance} from "../utils/index.js";
import {HANDLERS_TYPES, TOOLS_TYPES} from "../constants.js";

const LineRenderer = props => {
    const {strokeDasharray, strokeDashoffset} = React.useMemo(
        () => {
            const strokeWidth = parseInt(props.strokeWidth.replace("px", ""));
            const length = getPointsDistance([props.x, props.y], [props.x2, props.y2]);
            if (!isNaN(strokeWidth) && strokeWidth > 0) {
                if (props.strokeStyle === "dashed" || props.strokeStyle === "dotted") {
                    return getBalancedDash(length, strokeWidth, props.strokeStyle);
                }
            }
            // Default stroke dash
            return {
                strokeDasharray: "none",
                strokeDashoffset: "none",
            };
        },
        [props.strokeStyle, props.strokeWidth, props.x, props.y, props.x2, props.y2],
    );
    return (
        <line
            {...props.elementAttributes}
            x1={props.x}
            y1={props.y}
            x2={props.x2}
            y2={props.y2}
            fill="none"
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

export const LineTool = {
    id: "line",
    type: TOOLS_TYPES.LINE,
    handlers: HANDLERS_TYPES.POINTS,

    Component: LineRenderer,
    Icon: LineToolIcon,

    onCreateStart: (element, info, props) => ({
        x2: element.x,
        y2: element.y,
        strokeColor: props?.strokeColor || "#000",
        strokeWidth: props?.strokeWidth ?? "4px",
        strokeOpacity: props?.strokeOpacity ?? "1",
        strokeStyle: props?.strokeStyle || "solid",
    }),
    onCreateMove: (element, info, parse) => ({
        x2: parse(element.x + info.dx),
        y2: parse(element.y + info.dy),
    }),
    // onCreateEnd: () => ({}),

    onDrag: (element, info, parse) => ({
        x: parse(element.x + info.dx),
        y: parse(element.y + info.dy),
        x2: parse(element.x2 + info.dx),
        y2: parse(element.y2 + info.dy),
    }),
};
