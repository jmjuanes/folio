import React from "react";
import classNames from "classnames";
import {CheckIcon, renderIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

// @description dropdown component
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
export const Dropdown = React.forwardRef(({className, ...props}, ref) => (
    <div
        ref={ref}
        data-testid="dropdown"
        className={themed("absolute p-1 rounded-xl", "dropdown", className)}
        {...props}
    />
));

// @description dropdown header
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Header = ({className, ...props}) => (
    <div
        className={classNames("flex items-center gap-1 p-1 h-8", className)}
        {...props}
    />
);

// @description dropdown header button
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @param {string} props.text button text
// @param {function} props.onClick click event handler
// @returns {React.ReactNode} React component
Dropdown.HeaderButton = ({className, icon, text, onClick}) => (
    <div className={classNames("cursor-pointer flex items-center gap-1 p-1 rounded-lg hover:bg-gray-200", className)} onClick={onClick}>
        {!!icon && renderIcon(icon)}
        {!!text && <div className="text-xs">{text}</div>}
    </div>
);

// @description dropdown separator
// @param {object} props React props
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Separator = ({className, ...props}) => (
    <div
        data-testid="dropdown-separator"
        className={themed("w-full h-px my-1", "dropdown.separator", className)}
        {...props}
    />
);

// @description dropdown label
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @returns {React.ReactNode} React component
Dropdown.Label = ({className, ...props}) => (
    <div
        data-testid="dropdown-label"
        className={themed("select-none text-xs mb-1", "dropdown.label", className)}
        {...props}
    />
);

// @description dropdown item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.as HTML tag name
// @param {string} props.className CSS class name
// @param {boolean} props.disabled to display the item as disabled
// @returns {React.ReactNode} React component
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

// @description dropdown icon
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
// @param {string} props.icon icon name
// @returns {React.ReactNode} React component
Dropdown.Icon = ({className, icon, ...props}) => (
    <div className={classNames("flex items-center text-base", className)} {...props}>
        {renderIcon(icon)}
    </div>
);

// @description dropdown shortcut
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className CSS class name
Dropdown.Shortcut = ({className, ...props}) => (
    <div className={classNames("ml-auto text-xs text-right text-gray-600", className)} {...props} />
);

// @description dropdown check item
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {boolean} props.checked to display the item as checked
// @returns {React.ReactNode} React component
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
