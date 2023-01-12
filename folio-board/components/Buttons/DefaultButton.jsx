import React from "react";
import classNames from "classnames";

export const DefaultButton = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:3 gap:2 r:full": true,
        "bg:dark-700 text:white": true,
        "bg:dark-400:hover cursor:pointer": !props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
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
    text: "",
    icon: null,
    disabled: false,
    onClick: null,
};
