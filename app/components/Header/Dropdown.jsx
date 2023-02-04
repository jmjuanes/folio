import React from "react";
import classNames from "classnames";

const DropdownItem = props => {
    const classList = classNames({
        "d:flex items:center gap:3 r:md p:3": true,
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
        <div className={classList} onClick={handleClick}>
            <div className="d:flex items:center text:lg text:dark-700">
                {props.icon}
            </div>
            <div className="d:flex items:center text:dark-700">
                <strong>{props.text}</strong>
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
    <div className={classNames(props.classNames, "position:absolute mt:2")}>
        <div className="bg:white shadow:md w:48 p:6 r:lg d:flex flex:col gap:2">
            {Object.keys(props.items).map(key => (
                <DropdownItem
                    key={key}
                    text={props.items[key].text}
                    icon={props.items[key].icon}
                    disabled={props.items[key].disabled}
                    onClick={props.items[key].onClick}
                />
            ))}
        </div>
    </div>
);

Dropdown.defaultProps = {
    className: "top:0 left:0",
    items: {},
};
