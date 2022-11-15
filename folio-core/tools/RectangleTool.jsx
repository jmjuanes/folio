import React from "react";
import {InnerText} from "../components/Commons/InnerText.jsx";
import {getBalancedDash} from "../utils/index.js";
import {HANDLERS_TYPES} from "../constants.js";

const RectangleRenderer = props => {
    const {strokeDasharray, strokeDashoffset} = React.useMemo(
        () => {
            const strokeWidth = parseInt(props.strokeWidth.replace("px", ""));
            const length = 2 * (Math.abs(props.width) + Math.abs(props.height));
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
        [props.strokeStyle, props.width, props.height, props.strokeWidth],
    );
    return (
        <React.Fragment>
            <rect
                {...props.elementAttributes}
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                rx={props.radius}
                fill={props.fillColor}
                fillOpacity={props.fillOpacity}
                stroke={props.strokeColor}
                strokeWidth={props.strokeWidth}
                strokeOpacity={props.strokeOpacity}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {props.text && !props.editing && (
                <InnerText {...props} />
            )}
        </React.Fragment>
    );
};

export const RectangleTool = {
    Component: RectangleRenderer,

    // Rectangle options
    handlers: HANDLERS_TYPES.RECTANGLE,

    // Create a new rectangle
    onCreateStart: (element, info, props) => ({
        width: 0,
        height: 0,
        text: "",
        fillColor: props?.fillColor || "transparent",
        fillOpacity: props?.fillOpacity ?? "1",
        strokeColor: props?.strokeColor || "#000",
        strokeWidth: props?.strokeWidth ?? "4px",
        strokeOpacity: props?.strokeOpacity ?? "1",
        strokeStyle: props?.strokeStyle || "solid",
        radius: props?.radius ?? "0px",
        textColor: props?.textColor || "#000",
        textFont: props?.textFont || "",
        textSize: props?.textSize || 16,
        textAlign: props?.textAlign || "center",
        textWidth: 0,
        textHeight: 0,
    }),

    // Update element while user is creating it
    onCreateMove: (element, info) => ({
        x: Math.min(info.originalX, info.originalX + info.dx),
        y: Math.min(info.originalY, info.originalY + info.dy),
        width: Math.abs(info.dx),
        height: Math.abs(info.dy),
    }),

    // onCreateEnd: (element, info) => {},
    onDrag: (element, info) => ({
        x: element.x + info.dx,
        y: element.y + info.dy,
    }),

    // Get boundary points
    getBoundaryPoints: el => ([
        [el.x, el.y],
        [el.x + el.width, el.y],
        [el.x + el.width, el.y + el.height],
        [el.x, el.y + el.height],
    ]),

    // Updated element
    // onUpdated: (el, changedProps) => null,
};
