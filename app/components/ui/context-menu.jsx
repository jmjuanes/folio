import React from "react";
import classNames from "classnames";
import {CheckIcon} from "@josemi-icons/react";

export const ContextMenu = ({className, ...props}) => (
    <div
        data-testid="contextmenu"
        className={classNames(
            "bg-white shadow-md p-1 rounded-lg border border-neutral-200",
            className,
        )}
        {...props}
    />
);

ContextMenu.Item = ({className, inset = false, disabled = false, ...props}) => (
    <div
        data-testid="contextmenu-item"
        className={classNames({
            "relative flex items-center gap-2 select-none": true,
            "rounded-md text-sm pl-2 pr-2 pt-1 pb-1": true,
            "pl-8": inset,
            "cursor-pointer hover:bg-neutral-100": !disabled,
            "pointer-events-none opacity-60 cursor-disabled": disabled,
        }, className)}
        {...props}
    />
);

ContextMenu.CheckItem = ({checked, children, ...props}) => (
    <ContextMenu.Item {...props} inset={true}>
        {checked && (
            <div className="absolute text-lg top-0 left-0 mt-1 ml-2">
                <CheckIcon />
            </div>
        )}
        {children}
    </ContextMenu.Item>
);

ContextMenu.Separator = ({className, ...props}) => (
    <div
        data-testid="contextmenu-separator"
        className={classNames("w-full bg-neutral-200 h-px my-1", className)}
        {...props}
    />
);
