import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";

export const ContextMenu = ({className, ...props}) => (
    <div
        data-testid="contextmenu"
        className={classNames("p-1 rounded-xl bg-white shadow-sm border-1 border-gray-200", className)}
        {...props}
    />
);

ContextMenu.Item = ({className, disabled = false, ...props}) => (
    <div
        data-testid="contextmenu-item"
        className={classNames({
            "relative flex items-center gap-2 select-none rounded-lg text-sm px-2 py-1": true,
            "pointer-events-none opacity-60 cursor-disabled": disabled,
            "cursor-pointer": !disabled,
            "hover:bg-gray-200": !disabled,
        }, className)}
        {...props}
    />
);

ContextMenu.Icon = ({className, icon}) => (
    <div className={classNames("flex items-center text-base", className)}>
        {renderIcon(icon)}
    </div>
);

// @description context menu shortcut
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
ContextMenu.Shortcut = ({className, ...props}) => (
    <div className={classNames("ml-auto text-xs text-right text-gray-600", className)} {...props} />
);

ContextMenu.Separator = ({className, ...props}) => (
    <div
        data-testid="contextmenu-separator"
        className={classNames("w-full h-px my-1 bg-gray-200", className)}
        {...props}
    />
);
