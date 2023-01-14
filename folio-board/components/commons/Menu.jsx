import React from "react";
import classNames from "classnames";

export const Menu = props => (
    <div className={classNames("position:absolute z:6", props.className)}>
        <div className="p:6 w:64 bg:dark-700 text:white r:md">
            Content
        </div>
    </div>
);

Menu.defaultProps = {
    className: "",
    grid: false,
    background: "",
    onChange: null,
};
