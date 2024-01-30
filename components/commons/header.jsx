import React from "react";
import {renderIcon} from "@josemi-icons/react";
import classNames from "classnames";

export const HeaderButton = props => {
    const classList = classNames(props.className || "", {
        "flex items-center p-2 rounded-md": true,
        "cursor-pointer hover:bg-neutral-100 text-neutral-800": !props.disabled,
        "cursor-not-allowed o-40": props.disabled,
    });
    const handleClick = () => {
        return !props.disabled && props?.onClick?.();
    };
    return (
        <div className={classList} onClick={handleClick}>
            <div className="flex items-center text-xl">
                {renderIcon(props.icon)}
            </div>
        </div>
    );
};

export const HeaderContainer = props => (
    <div className="flex gap-1 p-1 rounded-lg shadow-sm bg-white border border-neutral-200">
        {props.children}
    </div>
);
