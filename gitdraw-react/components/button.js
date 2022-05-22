import React from "react";
import kofi from "kofi";

export const Button = props => {
    const classList = kofi.classNames(props.className, {
        "has-radius-md has-p-2 has-lh-none is-clickable": true,
        "has-bg-transparent has-bg-gray-200-hover": !props.active,
        "has-bg-blue-500 has-text-white": props.active,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <i className={`icon-${props.icon} has-size-2`} />
        </div>
    );
};

Button.defaultProps = {
    active: false,
    icon: "",
};
