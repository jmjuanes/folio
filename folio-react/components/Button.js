import React from "react";
import {classNames} from "../utils/classNames.js";

export const Button = props => {
    const classList = classNames([
        props.className || "",
        "has-radius-md has-p-2 has-lh-none is-clickable has-size-2",
        !props.active && "has-bg-body-hover has-text-white-hover",
        props.active && "has-bg-body has-text-white",
    ]);
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
