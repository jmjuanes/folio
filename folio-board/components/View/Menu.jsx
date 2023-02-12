import React from "react";
import classNames = require("classnames");

export const Menu = props => {
    const dropdownClass = classNames({
        "d:none d:block:group-focus-within": true,
        "top:full left:0": props.align === "left",
        "top:full right:0": props.align === "right",
    });
    return (
        <div className="d:flex position:relative group" tabIndex="0">
            <Button
                text={props.text}
                icon={props.icon}
            />
            <Dropdown
                className={dropdownClass}
                items={props.items}
            />
        </div>
    );
};

Menu.defaultProps = {
    align: "left",
    text: null,
    icon: null,
    items: [],
};
