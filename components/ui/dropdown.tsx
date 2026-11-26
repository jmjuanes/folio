import { Fragment, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { CheckIcon, renderIcon } from "mochicons/react";
import type { JSX, ReactNode, HTMLAttributes, PointerEvent, JSXElementConstructor } from "react";
import type { CSSProperties } from "react";

export type DropdownProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown component
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
export const Dropdown = ({ className, ...props }: DropdownProps): JSX.Element => (
    <div
        data-testid="dropdown"
        className={classNames({
            "absolute p-1 rounded-xl": true,
            "bg-white border-1 border-gray-200 shadow-sm": true,
        }, className)}
        {...props}
    />
);

export type DropdownHeaderProps = HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown header
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Header = ({ className, ...props }: DropdownHeaderProps): JSX.Element => (
    <div
        className={classNames("flex items-center gap-1 p-1 h-8", className)}
        {...props}
    />
);

export type DropdownHeaderButtonProps = {
    className?: string,
    icon?: string,
    text?: string,
    disabled?: boolean,
    onClick?: (event: PointerEvent<HTMLDivElement>) => void,
};

// @description dropdown header button
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @param {string} props.text button text
// @param {function} props.onClick click event handler
// @returns {React.ReactNode} React component
Dropdown.HeaderButton = ({ className, icon, text, onClick }: DropdownHeaderButtonProps): JSX.Element => (
    <div className={classNames("cursor-pointer flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200", className)} onClick={onClick}>
        {!!icon && renderIcon(icon)}
        {!!text && <div className="text-xs">{text}</div>}
    </div>
);

export type DropdownSeparatorProps = HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown separator
// @param {object} props React props
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Separator = ({ className, ...props }: DropdownSeparatorProps): JSX.Element => (
    <div
        data-testid="dropdown-separator"
        className={classNames("w-full h-px my-1 bg-gray-200", className)}
        {...props}
    />
);

export type DropdownLabelProps = HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown label
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Label = ({ className, ...props }: DropdownLabelProps): JSX.Element => (
    <div
        data-testid="dropdown-label"
        className={classNames("select-none text-xs mb-1 text-gray-600", className)}
        {...props}
    />
);

export type DropdownItemProps = HTMLAttributes<HTMLLinkElement> & {
    as?: string | JSXElementConstructor<any>,
    className?: string,
    disabled?: boolean,
    active?: boolean,
};

// @description dropdown item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.as HTML tag name
// @param {string} props.className CSS class name
// @param {boolean} props.disabled to display the item as disabled
// @returns {React.ReactNode} React component
Dropdown.Item = ({ as, className, active = false, disabled = false, ...props }: DropdownItemProps): JSX.Element => {
    const Component = as || "div";
    return (
        <Component
            data-testid="dropdown-item"
            className={classNames({
                "relative flex items-center gap-2 select-none": true,
                "rounded-lg text-sm no-underline px-2 py-1": true,
                "pointer-events-none opacity-60 cursor-not-allowed": disabled,
                "cursor-pointer": !disabled && !active,
                "hover:bg-gray-200": !disabled && !active,
                "bg-gray-200": active && !disabled,
            }, className)}
            tabIndex={0}
            {...props}
        />
    );
};

export type DropdownIconProps = HTMLAttributes<HTMLDivElement> & {
    className?: string,
    icon: string,
};

// @description dropdown icon
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @returns {React.ReactNode} React component
Dropdown.Icon = ({ className, icon, ...props }: DropdownIconProps): JSX.Element => (
    <div className={classNames("flex items-center text-base", className)} {...props}>
        {renderIcon(icon)}
    </div>
);

export type DropdownShortcutProps = HTMLAttributes<HTMLDivElement> & {
    className?: string,
};

// @description dropdown shortcut
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
Dropdown.Shortcut = ({ className, ...props }: DropdownShortcutProps): JSX.Element => (
    <div className={classNames("ml-auto text-xs text-right text-gray-600", className)} {...props} />
);

export type DropdownCheckItemProps = HTMLAttributes<HTMLLinkElement> & {
    checked?: boolean,
    className?: string,
    disabled?: boolean,
};

// @description dropdown check item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {boolean} props.checked to display the item as checked
// @returns {React.ReactNode} React component
Dropdown.CheckItem = ({ checked = false, children, ...props }: DropdownCheckItemProps): JSX.Element => (
    <Dropdown.Item {...props}>
        {checked && (
            <div className="absolute text-lg top-0 right-0 mt-1 mr-2">
                <CheckIcon />
            </div>
        )}
        {children}
    </Dropdown.Item>
);

export type DropdownPortalProps = {
    id: string,
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    disabled?: boolean,
    toggleClassName?: string,
    toggleStyle?: CSSProperties,
    toggleRender: (isVisible?: boolean) => JSX.Element,
    contentClassName?: string,
    contentStyle?: CSSProperties,
    contentRender: (close?: () => void) => JSX.Element,
};

type DropdownPortalCoordinates = [number | string, number | string, number | string, number | string];

// @description dropdown portal
Dropdown.Portal = (props: DropdownPortalProps): JSX.Element => {
    const position = props.position || "bottom-left";
    const [visible, setVisible] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const coordinates = useRef<DropdownPortalCoordinates | null>(null);

    // when clicking on the action item
    const handleToggleClick = useCallback((event: React.SyntheticEvent) => {
        if (!props.disabled && event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            coordinates.current = ["", "", "", ""];
            if (position === "bottom-left") {
                coordinates.current[0] = rect.bottom + window.scrollY;
                coordinates.current[2] = rect.left + window.scrollX;
            }
            if (position === "top-left") {
                coordinates.current[1] = window.innerHeight - rect.top + window.scrollY;
                coordinates.current[2] = rect.left + window.scrollX;
            }
            if (position === "bottom-right") {
                coordinates.current[0] = rect.bottom + window.scrollY;
                coordinates.current[3] = window.innerWidth - rect.right + window.scrollX;
            }
            if (position === "top-right") {
                coordinates.current[1] = window.innerHeight - rect.top + window.scrollY;
                coordinates.current[3] = window.innerWidth - rect.right + window.scrollX;
            }
            setVisible(true);
        }
    }, [setVisible, props.disabled]);

    // internal method to hide the dropdown
    const handleHideDropdown = useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    useEffect(() => {
        if (visible) {
            const handleClickOutside = (event: MouseEvent) => {
                event.preventDefault();
                const target = event.target as HTMLDivElement;
                if (contentRef.current && !contentRef.current.contains(target)) {
                    setVisible(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [visible]);

    const coordinatesStyle = useMemo(() => {
        if (coordinates.current) {
            return {
                top: coordinates.current[0],
                bottom: coordinates.current[1],
                left: coordinates.current[2],
                right: coordinates.current[3],
                ...(props.contentStyle || {}),
            };
        }
        return null;
    }, [coordinates.current, props.contentStyle]);

    return (
        <Fragment>
            <div className={props.toggleClassName || "flex items-center"} style={props.toggleStyle} onClick={handleToggleClick}>
                {props.toggleRender(visible)}
            </div>
            {visible && coordinatesStyle && (
                <Fragment>
                    {createPortal(
                        <div className="fixed top-0 left-0 right-0 bottom-0 bg-transparent z-50" />,
                        document.body
                    )}
                    {createPortal(
                        <div ref={contentRef} className={props.contentClassName} style={coordinatesStyle}>
                            {props.contentRender(handleHideDropdown)}
                        </div>,
                        document.body
                    )}
                </Fragment>
            )}
        </Fragment>
    );
};
