import React from "react";
import classNames from "classnames";

export const SimpleButton = props => {
    const classList = classNames({
        "d:flex items:center justify:center px:4 py:2 gap:2": true,
        "r:full bg:light-900 bg:light-800:hover text:dark-700": true,
        "font:bold cursor:pointer": true,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="text:xl d:flex items:center">
                {props.children}
            </div>
        </div>
    );
};

SimpleButton.defaultProps = {
    onClick: null,
};
