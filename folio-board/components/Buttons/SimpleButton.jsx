import React from "react";
import classNames from "classnames";

export const SimpleButton = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:2 gap:2 r:full": true,
        "cursor:pointer bg:light-900 text:dark-700": !props.disabled && !props.active,
        "bg:dark-500 text:white": props.active,
        "cursor:not-allowed text:dark-100 bg:light-500": props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="text:xl d:flex items:center">
                {props.icon}
            </div>
        </div>
    );
};

SimpleButton.defaultProps = {
    className: "",
    icon: null,
    active: false,
    disabled: false,
    onClick: null,
};
