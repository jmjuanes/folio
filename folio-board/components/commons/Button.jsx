import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:4 gap:2": true,
        "r:lg bg:dark-700 bg:dark-400:hover text:white": true,
        "cursor:pointer": true,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon && (
                <div className={classNames(props.iconClass, "d:flex items:center")}>
                    {props.icon}
                </div>
            )}
            {props.text && (
                <div className={props.textClass}>
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    text: "",
    textClass: "",
    icon: null,
    iconClass: "text:lg",
    onClick: null,
};
