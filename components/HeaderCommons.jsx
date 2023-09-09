import React from "react";
import {renderIcon} from "@josemi-icons/react";
import classNames from "classnames";

export const HeaderSeparator = () => (
    <div className="w-px bg-gray-600" />
);

export const HeaderButton = props => {
    const classList = classNames(props.className || "", {
        "flex items-center rounded-md py-1 px-2": true,
        "cursor-pointer hover:bg-gray-200 text-gray-900": !props.disabled,
        "cursor-not-allowed o-80": props.disabled,
    });
    const handleClick = () => {
        return !props.disabled && props.onClick();
    };
    return (
        <div className={classList} onClick={handleClick}>
            <div className="flex items-center text-xl ">
                {renderIcon(props.icon)}
            </div>
        </div>
    );
};

export const HeaderContainer = props => (
    <div className="flex gap-1 border-2 border-gray-900 h-12 p-1 rounded-lg bg-white shadow-md">
        {props.children}
    </div>
);
