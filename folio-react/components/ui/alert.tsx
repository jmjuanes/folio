import React from "react";
import classNames from "classnames";
import {renderIcon} from "@josemi-icons/react";

export type AlertProps = {
    className?: string,
    variant?: string,
    icon?: string,
    text?: string,
    children?: React.ReactNode,
} & React.HTMLAttributes<HTMLDivElement>;

// @description: simple alert component
// @param {object} props React props
// @param {string} [props.className] additional class names
// @param {string} [props.variant] alert variant (e.g. "warning")
// @param {string} [props.icon] icon name (e.g. "lock")
// @param {string} [props.text] alert text
// @param {React.ReactNode} [props.children] alert children (overrides text)
export const Alert = ({className, variant = "", icon = "", text = "", children, ...props}: AlertProps): React.JSX.Element => {
    const alertClassName = classNames({
        "rounded-xl shadow-sm border-1 p-3 flex gap-2 items-center": true,
        "bg-yellow-100 text-yellow-900 border-yellow-200": variant === "warning",
    }, className);

    return (
        <div className={alertClassName} {...props}>
            {icon && (
                <div className="flex items-center text-lg">
                    {renderIcon(icon)}
                </div>
            )}
            <div className="text-sm leading-none">{children || text}</div>
        </div>
    );
};
