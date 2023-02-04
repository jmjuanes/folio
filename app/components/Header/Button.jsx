import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "d:flex items:center justify:center px:4 py:3 gap:2 select:none": true,
        "r:full": props.rounded,
        "r:lg": !props.rounded,
        "cursor:pointer": !props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {!!props.icon && (
                <div className="text:lg d:flex items:center">
                    {props.icon}
                </div>
            )}
            {!!props.text && (
                <div className="">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    className: "bg:light-900 bg:light-800:hover text:dark-700",
    text: "",
    icon: null,
    rounded: false,
    disabled: false,
    onClick: null,
};
