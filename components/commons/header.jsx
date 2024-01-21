import React from "react";
import {renderIcon} from "@josemi-icons/react";
import classNames from "classnames";

export const HeaderButton = props => {
    const classList = classNames(props.className || "", {
        "flex items-center p-3": true,
        "rounded-tl-lg rounded-bl-lg": props.roundedStart,
        "rounded-tr-lg rounded-br-lg": props.roundedEnd,
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

HeaderButton.defaultProps = {
    roundedStart: true,
    roundedEnd: true,
};

export const HeaderContainer = props => (
    <div className="flex gap-1 p-0 rounded-lg shadow-sm bg-white border border-neutral-200">
        {props.children}
    </div>
);
