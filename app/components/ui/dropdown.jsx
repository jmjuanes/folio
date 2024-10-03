import React from "react";
import classNames from "classnames";
import {CheckIcon, renderIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

export const Dropdown = ({className, ...props}) => (
    <div
        data-testid="dropdown"
        className={themed("absolute p-1 rounded-xl", "dropdown", className)}
        {...props}
    />
);

Dropdown.Separator = ({className, ...props}) => (
    <div
        data-testid="dropdown-separator"
        className={themed("w-full h-px my-1", "dropdown.separator", className)}
        {...props}
    />
);

Dropdown.Label = ({className, ...props}) => (
    <div
        data-testid="dropdown-label"
        className={themed("select-none text-xs mb-1", "dropdown.label", className)}
        {...props}
    />
);

Dropdown.Item = ({as, className, disabled = false, ...props}) => {
    const Component = as || "div";
    return (
        <Component
            data-testid="dropdown-item"
            className={themed({
                "relative flex items-center gap-2 select-none": true,
                "rounded-lg text-sm no-underline px-2 py-1": true,
                "pointer-events-none opacity-60 cursor-not-allowed": disabled,
                "cursor-pointer": !disabled,
                "dropdown.item": !disabled,
            }, className)}
            tabIndex="0"
            {...props}
        />
    );
};

Dropdown.Icon = ({className, icon, ...props}) => (
    <div className={classNames("flex items-center text-base", className)} {...props}>
        {renderIcon(icon)}
    </div>
);

Dropdown.CheckItem = ({checked = false, children, ...props}) => (
    <Dropdown.Item {...props}>
        {checked && (
            <div className="absolute text-lg top-0 right-0 mt-1 mr-2">
                <CheckIcon />
            </div>
        )}
        {children}
    </Dropdown.Item>
);
