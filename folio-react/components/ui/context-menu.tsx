import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";

export type ContextMenuContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

export type ContextMenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
    disabled?: boolean;
};

export type ContextMenuIconProps = {
    className?: string;
    icon: string;
};

export type ContextMenuShortcutProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
};

export type ContextMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
};

export type ContextMenuComponents = {
    Container: (props: ContextMenuContainerProps) => React.JSX.Element;
    Item: (props: ContextMenuItemProps) => React.JSX.Element;
    Icon: (props: ContextMenuIconProps) => React.JSX.Element;
    Shortcut: (props: ContextMenuShortcutProps) => React.JSX.Element;
    Separator: (props: ContextMenuSeparatorProps) => React.JSX.Element;
};

export const ContextMenu = {
    Container: ({ className, ...otherProps }: ContextMenuContainerProps): React.JSX.Element => (
        <div
            data-testid="contextmenu"
            className={classNames("p-1 rounded-xl bg-white shadow-sm border-1 border-gray-200", className)}
            {...otherProps}
        />
    ),
    Item: ({ className, disabled = false, ...otherProps }: ContextMenuItemProps): React.JSX.Element => (
        <div
            data-testid="contextmenu-item"
            className={classNames({
                "relative flex items-center gap-2 select-none rounded-lg text-sm px-2 py-1": true,
                "pointer-events-none opacity-60 cursor-disabled": disabled,
                "cursor-pointer": !disabled,
                "hover:bg-gray-200": !disabled,
            }, className)}
            {...otherProps}
        />
    ),
    Icon: ({ className, icon }: ContextMenuIconProps): React.JSX.Element => (
        <div className={classNames("flex items-center text-base", className)}>
            {renderIcon(icon)}
        </div>
    ),
    Shortcut: ({ className, ...otherProps }: ContextMenuShortcutProps): React.JSX.Element => (
        <div className={classNames("ml-auto text-xs text-right text-gray-600", className)} {...otherProps} />
    ),
    Separator: ({ className, ...otherProps }: ContextMenuSeparatorProps): React.JSX.Element => (
        <div
            data-testid="contextmenu-separator"
            className={classNames("w-full h-px my-1 bg-gray-200", className)}
            {...otherProps}
        />
    ),
} as ContextMenuComponents;
