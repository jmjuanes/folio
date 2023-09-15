import React from "react";
import classnames from "classnames";
import {ArrowUpIcon, ArrowDownIcon} from "@josemi-icons/react";

export const HINT_POSITION_TOP = "position:top";
export const HINT_POSITION_BOTTOM = "position:bottom";

const defaultStyle = {
    pointerEvents: "none",
    transform: "translateX(-50%)",
};

export const HintMessage = props => {
    const classList = classnames(props.className, {
        "absolute z-1 text-gray-500 animation-fadein": true,
        "bottom-full left-half mb-2": props.position === HINT_POSITION_TOP,
        "top-full left-half mt-2": props.position === HINT_POSITION_BOTTOM,
    });

    return (
        <div className={classList} style={defaultStyle}>
            {props.position === HINT_POSITION_BOTTOM && (
                <div className="flex justify-center text-gray-600 text-3xl mb-1 animation-pulse">
                    <ArrowUpIcon />
                </div>
            )}
            <div className={classnames(props.contentClassName, "flex flex-col items-center")}>
                <div className="text-center font-bold">{props.title}</div>
                <div className="text-sm">{props.content || props.children}</div>
            </div>
            {props.position === HINT_POSITION_TOP && (
                <div className="flex justify-center text-gray-600 text-3xl mt-2 animation-pulse">
                    <ArrowDownIcon />
                </div>
            )}
        </div>
    );

};

HintMessage.defaultProps = {
    className: "",
    contentClassName: "w-48",
    position: HINT_POSITION_TOP,
    title: "",
    content: "",
};
