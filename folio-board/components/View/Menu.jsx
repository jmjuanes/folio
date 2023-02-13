import React from "react";
import classNames from "classnames";
import {Button} from "../commons/Button.jsx";
import {Dropdown} from "../commons/Dropdown.jsx";

export const Menu = props => (
    <div className="d:flex position:relative group" tabIndex="0">
        <Button
            className={"bg:white bg:light-300:hover b:1 b:light-900 b:solid"}
            text={props.text}
            textClassName="text:sm"
            icon={props.icon}
            iconClassName="text:lg"
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
