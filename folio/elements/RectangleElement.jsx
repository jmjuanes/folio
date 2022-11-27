import React from "react";
// import {InnerText} from "../components/common/InnerText.jsx";
// import {RectangleToolIcon} from "../components/icons/index.jsx";
// import {getBalancedDash, getRectanglePerimeter} from "../utils/index.js";

const RectangleRenderer = props => {
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    // const [strokeDasharray, strokeDashoffset] = React.useMemo(
    //     () => {
    //         const length = getRectanglePerimeter(width, height);
    //         return getBalancedDash(length, props.strokeWidth, props.strokeStyle);
    //     },
    //     [width, height, props.strokeWidth, props.strokeStyle],
    // );
    return (
        <React.Fragment>
            <rect
                x={Math.min(props.x1, props.x2)}
                y={Math.min(props.y1, props.y2)}
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill="transparent"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/*
            {props.text && !props.editing && (
                <InnerText {...props} />
            )}
            */}
        </React.Fragment>
    );
};

export const RectangleElement = {
    Component: RectangleRenderer,
    // Icon: RectangleToolIcon,

    initialize: () => ({
        resizeHandlers: true,
        text: "",
    }),

    // Create a new rectangle
    onCreateStart: (element, info, parse) => ({
        x1: parse(info.originalX),
        x2: parse(info.originalX),
        y1: parse(info.originalY),
        y2: parse(info.originalY),
    }),

    // Update element while user is creating it
    onCreateMove: (element, info, parse) => ({
        x2: parse(info.currentX),
        y2: parse(info.currentY),
    }),

    onCreateEnd: (element, info, parse) => ({
        x1: Math.min(element.x1, element.x2),
        x2: Math.max(element.x1, element.x2),
        y1: Math.min(element.y1, element.y2),
        y2: Math.max(element.y1, element.y2),
    }),

    onDrag: (element, info, parse) => ({
        x1: parse(element.x1 + info.dx),
        x2: parse(element.x2 + info.dx),
        y1: parse(element.y1 + info.dy),
        y2: parse(element.y2 + info.dy),
    }),

    // onResize
};
