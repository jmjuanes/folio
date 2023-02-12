import React from "react";
import classNames = require("classnames");
import {Button} from "../commons/Button.jsx";
import {Dropdown} from "../commons/Dropdown.jsx";

export const Menu = props => (
    <div className="d:flex position:relative group" tabIndex="0">
        <Button
            text={props.text}
            icon={props.icon}
            disabled={props.disabled}
        />
        {!props.disabled && (
            <Dropdown
                className={classNames({
                    "d:none d:block:group-focus-within": true,
                    "top:full left:0": props.align === "left",
                    "top:full right:0": props.align === "right",
                })}
                items={props.items}
            />
        )}
    </div>
);

Menu.defaultProps = {
    align: "left",
    text: null,
    icon: null,
    disabled: false,
    items: [],
};
