import React from "react";
import kofi from "kofi";

export const Button = props => {
    const classList = kofi.classNames(props.className, {
        "has-radius-md has-p-2 has-lh-none is-clickable has-size-2": true,
        "has-bg-transparent has-bg-gray-200-hover": !props.active,
        "has-bg-blue-200 has-text-blue-500": props.active,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon}
        </div>
    );
};

Button.defaultProps = {
    active: false,
    icon: null,
};
