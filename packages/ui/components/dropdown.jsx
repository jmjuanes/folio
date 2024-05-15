import React from "react";
import classNames from "classnames";
import {CheckIcon} from "@josemi-icons/react";

export const Dropdown = ({className, ...props}) => (
    <div
        data-testid="dropdown"
        className={classNames(
            "absolute bg-white border border-neutral-200 shadow-sm p-1 rounded-lg",
            className,
        )}
        {...props}
    />
);

Dropdown.Separator = ({className, ...props}) => (
    <div
        data-testid="dropdown-separator"
        className={classNames("w-full bg-neutral-100 h-px my-1", className)}
        {...props}
    />
);

Dropdown.Label = ({className, ...props}) => (
    <div
        data-testid="dropdown-label"
        className={classNames("select-none text-xs mb-1 text-neutral-600", className)}
        {...props}
    />
);

Dropdown.Item = ({as, className, disabled = false, inset = false, ...props}) => {
    const Component = as || "div";
    return (
        <Component
            data-testid="dropdown-item"
            className={classNames({
                "relative flex items-center gap-2 select-none": true,
                "rounded-md text-sm no-underline pl-2 pr-2 py-1": true,
                "pl-8": inset,
                "cursor-pointer hover:bg-neutral-100": !disabled,
                "pointer-events-none opacity-60 cursor-not-allowed": disabled,
            }, className)}
            tabIndex="0"
            {...props}
        />
    );
};

Dropdown.Icon = ({className, ...props}) => (
    <div
        data-testid="dropdown-icon"
        className={classNames("flex items-center text-base", className)}
        {...props}
    />
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
