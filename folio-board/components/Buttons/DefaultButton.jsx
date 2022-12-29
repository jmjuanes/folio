import React from "react";
import classNames from "classnames";

export const DefaultButton = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:3 gap:2": true,
        "r:full bg:dark-700 bg:dark-400:hover text:white": true,
        "font:bold cursor:pointer": true,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="text:lg d:flex items:center">
                {props.children}
            </div>
            <div>{props.text}</div>
        </div>
    );
};

DefaultButton.defaultProps = {
    text: "",
    onClick: null,
};
