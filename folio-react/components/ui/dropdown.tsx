import React from "react";
import classNames from "classnames";
import {CheckIcon, renderIcon} from "@josemi-icons/react";

export type DropdownProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown component
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
export const Dropdown = ({ className, ...props }: DropdownProps): React.JSX.Element => (
    <div
        data-testid="dropdown"
        className={classNames({
            "absolute p-1 rounded-xl": true,
            "bg-white border-1 border-gray-200 shadow-sm": true,
        }, className)}
        {...props}
    />
);

export type DropdownHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown header
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Header = ({ className, ...props }: DropdownHeaderProps): React.JSX.Element => (
    <div
        className={classNames("flex items-center gap-1 p-1 h-8", className)}
        {...props}
    />
);

export type DropdownHeaderButtonProps = {
    className?: string,
    icon?: string,
    text?: string,
    onClick?: (event: React.PointerEvent<HTMLDivElement>) => void,
};

// @description dropdown header button
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @param {string} props.text button text
// @param {function} props.onClick click event handler
// @returns {React.ReactNode} React component
Dropdown.HeaderButton = ({ className, icon, text, onClick }: DropdownHeaderButtonProps): React.JSX.Element => (
    <div className={classNames("cursor-pointer flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200", className)} onClick={onClick}>
        {!!icon && renderIcon(icon)}
        {!!text && <div className="text-xs">{text}</div>}
    </div>
);

export type DropdownSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown separator
// @param {object} props React props
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Separator = ({ className, ...props }: DropdownSeparatorProps): React.JSX.Element => (
    <div
        data-testid="dropdown-separator"
        className={classNames("w-full h-px my-1 bg-gray-200", className)}
        {...props}
    />
);

export type DropdownLabelProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown label
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Label = ({ className, ...props }: DropdownLabelProps): React.JSX.Element => (
    <div
        data-testid="dropdown-label"
        className={classNames("select-none text-xs mb-1 text-gray-600", className)}
        {...props}
    />
);

export type DropdownItemProps = React.HTMLAttributes<HTMLDivElement> & {
    as?: string | React.JSXElementConstructor<any>,
    className?: string,
    disabled?: boolean,
};

// @description dropdown item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.as HTML tag name
// @param {string} props.className CSS class name
// @param {boolean} props.disabled to display the item as disabled
// @returns {React.ReactNode} React component
Dropdown.Item = ({ as, className, disabled = false, ...props }: DropdownItemProps): React.JSX.Element => {
    const Component = as || "div";
    return (
        <Component
            data-testid="dropdown-item"
            className={classNames({
                "relative flex items-center gap-2 select-none": true,
                "rounded-lg text-sm no-underline px-2 py-1": true,
                "pointer-events-none opacity-60 cursor-not-allowed": disabled,
                "cursor-pointer": !disabled,
                "hover:bg-gray-200": !disabled,
            }, className)}
            tabIndex={0}
            {...props}
        />
    );
};

export type DropdownIconProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
    icon: string,
};

// @description dropdown icon
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @returns {React.ReactNode} React component
Dropdown.Icon = ({ className, icon, ...props }: DropdownIconProps): React.JSX.Element => (
    <div className={classNames("flex items-center text-base", className)} {...props}>
        {renderIcon(icon)}
    </div>
);

export type DropdownShortcutProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown shortcut
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
Dropdown.Shortcut = ({ className, ...props }: DropdownShortcutProps): React.JSX.Element => (
    <div className={classNames("ml-auto text-xs text-right text-gray-600", className)} {...props} />
);

export type DropdownCheckItemProps = React.HTMLAttributes<HTMLDivElement> & {
    checked?: boolean,
    className?: string,
    disabled?: boolean,
};

// @description dropdown check item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {boolean} props.checked to display the item as checked
// @returns {React.ReactNode} React component
Dropdown.CheckItem = ({ checked = false, children, ...props }: DropdownCheckItemProps): React.JSX.Element => (
    <Dropdown.Item {...props}>
        {checked && (
            <div className="absolute text-lg top-0 right-0 mt-1 mr-2">
                <CheckIcon />
            </div>
        )}
        {children}
    </Dropdown.Item>
);
