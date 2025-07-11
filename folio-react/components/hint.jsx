import React from "react";
import classNames from "classnames";
import { ArrowUpIcon, ArrowDownIcon } from "@josemi-icons/react";

export const HINT_POSITION_TOP = "top";
export const HINT_POSITION_BOTTOM = "bottom";

const defaultStyle = {
    pointerEvents: "none",
    transform: "translateX(-50%)",
};

export const Hint = props => {
    const classList = classNames({
        "absolute z-10 animation-fadein": true,
        "bottom-full left-half mb-2": props.position === HINT_POSITION_TOP,
        "top-full left-half mt-2": props.position === HINT_POSITION_BOTTOM,
    }, props.className);

    return (
        <div className={classList} style={defaultStyle}>
            {props.position === HINT_POSITION_BOTTOM && (
                <div className="flex justify-center text-xl mb-1 animation-pulse text-gray-600">
                    <ArrowUpIcon />
                </div>
            )}
            <div className="flex flex-col items-center w-48">
                <div className="text-center text-sm text-gray-600">
                    <strong>{props.title}</strong>
                </div>
                <div className="text-xs text-center text-gray-500">
                    {props.content || props.children}
                </div>
            </div>
            {props.position === HINT_POSITION_TOP && (
                <div className="flex justify-center text-xl mt-2 animation-pulse text-gray-600">
                    <ArrowDownIcon />
                </div>
            )}
        </div>
    );

};
