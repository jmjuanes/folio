import React from "react";
import classNames from "classnames";

export const DropdownItem = props => {
    const classList = classNames({
        "d:flex items:center gap:2 r:md px:3 py:2 select:none": true,
        "bg:light-200:hover cursor:pointer": !props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
    });
    const handleClick = () => {
        if (!props.disabled && typeof props.onClick === "function") {
            if (document.activeElement && document.activeElement !== document.body) {
                document.activeElement.blur();
            }
            return props.onClick();
        }
    };
    return (
        <div className={classList} tabIndex="0" onClick={handleClick}>
            <div className="d:flex text:lg items:center text:dark-700">
                {props.icon}
            </div>
            <div className="d:flex items:center text:sm text:dark-700">
                <span>{props.text}</span>
            </div>
        </div>
    );
};

DropdownItem.defaultProps = {
    icon: null,
    text: null,
    disabled: false,
    onClick: null,
};

export const Dropdown = props => (
    <div className={classNames(props.className, "position:absolute mt:1")}>
        <div className="bg:white shadow:md w:56 p:3 r:lg d:flex flex:col gap:0">
            {props.children}
        </div>
    </div>
);

Dropdown.defaultProps = {
    className: "top:0 left:0",
};
