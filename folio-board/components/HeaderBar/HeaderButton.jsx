import React from "react";
import classNames from "classnames";

export const HeaderButton = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:2 gap:2": true,
        "r:xl bg:dark-700 bg:dark-400:hover text:white": true,
        "font:bold cursor:pointer": true,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.children}
            <div>{props.text}</div>
        </div>
    );
};

HeaderButton.defaultProps = {
    text: null,
    onClick: null,
};
