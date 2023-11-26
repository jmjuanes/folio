import React from "react";
import classNames from "classnames";

import {CheckIcon, ExternalLinkIcon} from "./Icons.jsx";

export const DropdownSeparator = () => (
    <div className="bg-neutral-200 w-full h-px my-2" />
);

export const DropdownGroup = props => (
    <div className="text-xs mb-1 px-2 text-neutral-600 select-none">
        {props.title}
    </div>
);

export const DropdownItem = props => {
    const classList = classNames({
        "flex items-center gap-2 rounded-md px-3 py-2 select-none": true,
        "bg-neutral-950 text-white": props.active && !props.disabled,
        "hover:bg-neutral-100 cursor-pointer": !props.active && !props.disabled,
        "o-70 cursor-not-allowed": props.disabled,
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
            <div className="flex text-lg items-center">
                {props.icon}
            </div>
            <div className="flex items-center text-sm">
                <span>{props.text}</span>
            </div>
        </div>
    );
};

DropdownItem.defaultProps = {
    icon: null,
    text: null,
    active: false,
    disabled: false,
    onClick: null,
};

export const DropdownLinkItem = props => {
    const classList = classNames({
        "flex items-center gap-2 rounded-md px-3 py-2 select-none": true,
        "hover:bg-neutral-100 cursor-pointer no-underline": true,
    });
    return (
        <a className={classList} href={props.url} target="_blank">
            <div className="flex text-lg items-center">
                <ExternalLinkIcon />
            </div>
            <div className="flex items-center text-sm">
                <span>{props.text}</span>
            </div>
        </a>
    );
};

DropdownLinkItem.defaultProps = {
    url: "",
    text: "",
};

export const DropdownCheckItem = props => (
    <div className="flex items-center gap-2 rounded-md px-3 py-2 select-none hover:bg-neutral-100 cursor-pointer" onClick={props.onClick}>
        <div className="flex text-lg items-center">
            {props.icon}
        </div>
        <div className="flex items-center text-sm">
            <span>{props.text}</span>
        </div>
        {props.active && (
            <div className="ml-auto flex items-center text-sm">
                <CheckIcon />
            </div>
        )}
    </div>
);

DropdownCheckItem.defaultProps = {
    active: false,
    icon: null,
    text: null,
    onClick: null,
};

export const Dropdown = props => (
    <div className={classNames(props.className, "absolute mt-1 z-5")}>
        <div className="bg-white shadow-md w-56 p-1 rounded-lg flex flex-col gap-0 border border-neutral-200">
            {props.children}
        </div>
    </div>
);

Dropdown.defaultProps = {
    className: "top-0 left-0",
};
