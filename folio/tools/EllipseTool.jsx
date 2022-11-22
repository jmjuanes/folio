import React from "react";
import {InnerText} from "../components/common/InnerText.jsx";
import {CircleToolIcon} from "../components/icons/index.jsx";
import {getBalancedDash, getEllipsePerimeter} from "../utils/index.js";
import {HANDLERS_TYPES, TOOLS_TYPES} from "../constants.js";

const EllipseRenderer = props => {
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(props.width / 2, props.height / 2);
            return getBalancedDash(length, props.strokeWidth, props.strokeStyle);
        },
        [props.width, props.height, props.strokeWidth, props.strokeStyle],
    );
    return (
        <React.Fragment>
            <ellipse
                {...props.elementAttributes}
                cx={props.x + props.width / 2}
                cy={props.y + props.height / 2}
                rx={props.width / 2}
                ry={props.height / 2}
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

export const EllipseTool = {
    id: "ellipse",
    title: "Ellipse",
    type: TOOLS_TYPES.SHAPE,
    handlers: HANDLERS_TYPES.RECTANGLE,

    Component: EllipseRenderer,
    Icon: CircleToolIcon,

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
        textColor: props?.textColor || "#000",
        textFont: props?.textFont || "",
        textSize: props?.textSize || 16,
        textAlign: props?.textAlign || "center",
        textWidth: 0,
        textHeight: 0,
    }),

    // Update element while user is creating it
    onCreateMove: (element, info, parse) => ({
        width: Math.max(1, parse(info.dx)),
        height: Math.max(1, parse(info.dy)),
    }),

    // onCreateEnd: (element, info) => {},
    onDrag: (element, info, parse) => ({
        x: parse(element.x + info.dx),
        y: parse(element.y + info.dy),
    }),
};
