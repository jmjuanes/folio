import React from "react";
import {
    OBJECT_DIMENSIONS_FILL_COLOR,
    OBJECT_DIMENSIONS_TEXT_COLOR,
    OBJECT_DIMENSIONS_TEXT_SIZE,
} from "../constants.js";

export const ObjectDimensions = props => {
    const style = {
        color: OBJECT_DIMENSIONS_TEXT_COLOR,
        fontSize: OBJECT_DIMENSIONS_TEXT_SIZE,
        backgroundColor: OBJECT_DIMENSIONS_FILL_COLOR,
        borderRadius: "0.25rem",
        display: "inline-flex",
        lineHeight: "1",
        padding: "0.25rem",
        pointerEvents: "none",
        position: "absolute",
        top: props.y + "px",
        left: props.x + "px",
        textWrap: "nowrap",
        transform: `translate(${props.translateX || "-100%"},${props.translateY || "0.5rem"})`,
        userSelect: "none",
        width: "content",
    };
    return (
        <div className={props.className} style={style}>
            <div>{props.value || "-"}</div>
        </div>
    );
};
