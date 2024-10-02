import React from "react";
import {ArrowUpIcon, ArrowDownIcon} from "@josemi-icons/react";
import {themed} from "../contexts/theme.jsx";

export const HINT_POSITION_TOP = "top";
export const HINT_POSITION_BOTTOM = "bottom";

const defaultStyle = {
    pointerEvents: "none",
    transform: "translateX(-50%)",
};

export const Hint = props => {
    const classList = themed("hint", {
        "absolute z-10 animation-fadein": true,
        "bottom-full left-half mb-2": props.position === HINT_POSITION_TOP,
        "top-full left-half mt-2": props.position === HINT_POSITION_BOTTOM,
    }, props.className);

    return (
        <div className={classList} style={defaultStyle}>
            {props.position === HINT_POSITION_BOTTOM && (
                <div className={themed("flex justify-center text-xl mb-1 animation-pulse", "hint.icon")}>
                    <ArrowUpIcon />
                </div>
            )}
            <div className={themed("flex flex-col items-center", "hint.content", props.contentClassName || "w-48")}>
                <div className={themed("text-center text-sm", "hint.content.title")}>
                    <strong>{props.title}</strong>
                </div>
                <div className={themed("text-xs text-center", "hint.content.description")}>
                    {props.content || props.children}
                </div>
            </div>
            {props.position === HINT_POSITION_TOP && (
                <div className={themed("flex justify-center text-xl mt-2 animation-pulse", "hint.icon")}>
                    <ArrowDownIcon />
                </div>
            )}
        </div>
    );

};
