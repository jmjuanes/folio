import React from "react";
import classNames from "classnames";
import {renderIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

export const ContextMenu = ({className, ...props}) => (
    <div
        data-testid="contextmenu"
        className={themed("p-1 rounded-xl", "context-menu", className)}
        {...props}
    />
);

ContextMenu.Item = ({className, disabled = false, ...props}) => (
    <div
        data-testid="contextmenu-item"
        className={themed({
            "relative flex items-center gap-2 select-none rounded-lg text-sm px-2 py-1": true,
            "pointer-events-none opacity-60 cursor-disabled": disabled,
            "cursor-pointer": !disabled,
            "context-menu.item": !disabled,
        }, className)}
        {...props}
    />
);

ContextMenu.Icon = ({className, icon}) => (
    <div className={classNames("flex items-center text-base", className)}>
        {renderIcon(icon)}
    </div>
);

ContextMenu.Separator = ({className, ...props}) => (
    <div
        data-testid="contextmenu-separator"
        className={themed("w-full h-px my-1", "context-menu.separator", className)}
        {...props}
    />
);
