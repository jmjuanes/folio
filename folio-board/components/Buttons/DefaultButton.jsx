import React from "react";
import classNames from "classnames";

export const DefaultButton = props => {
    const classList = classNames(props.className, {
        "d:flex items:center justify:center px:4 py:3 gap:2 r:full": true,
        "cursor:pointer": !props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
        // "bg:light-900 bg:light-800:hover text:dark-700":,
        // "bg:dark-700 text:white": props.theme === THEMES.DARK,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="text:lg d:flex items:center">
                {props.icon}
            </div>
            <div className="">
                <strong>{props.text}</strong>
            </div>
        </div>
    );
};

DefaultButton.defaultProps = {
    className: "bg:light-900 bg:light-800:hover text:dark-700",
    text: "",
    icon: null,
    disabled: false,
    onClick: null,
};
