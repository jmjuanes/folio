import React from "react";
import classnames from "classnames";
import {ArrowUpIcon, ArrowDownIcon} from "@josemi-icons/react";

export const HINT_POSITION_TOP = "top";
export const HINT_POSITION_BOTTOM = "bottom";

const defaultStyle = {
    pointerEvents: "none",
    transform: "translateX(-50%)",
};

export const Hint = props => {
    const classList = classnames(props.className, {
        "absolute z-1 animation-fadein": true,
        "bottom-full left-half mb-2": props.position === HINT_POSITION_TOP,
        "top-full left-half mt-2": props.position === HINT_POSITION_BOTTOM,
    });

    return (
        <div className={classList} style={defaultStyle}>
            {props.position === HINT_POSITION_BOTTOM && (
                <div className="flex justify-center text-neutral-600 text-xl mb-1 animation-pulse">
                    <ArrowUpIcon />
                </div>
            )}
            <div className={classnames(props.contentClassName, "flex flex-col items-center")}>
                <div className="text-center text-sm text-neutral-600">
                    <strong>{props.title}</strong>
                </div>
                <div className="text-xs text-center text-neutral-500">
                    {props.content || props.children}
                </div>
            </div>
            {props.position === HINT_POSITION_TOP && (
                <div className="flex justify-center text-neutral-600 text-xl mt-2 animation-pulse">
                    <ArrowDownIcon />
                </div>
            )}
        </div>
    );

};

Hint.defaultProps = {
    className: "",
    contentClassName: "w-48",
    position: HINT_POSITION_TOP,
    title: "",
    content: "",
};
