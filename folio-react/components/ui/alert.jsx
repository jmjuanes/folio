import React from "react";
import classNames from "classnames";
import {renderIcon} from "@josemi-icons/react";

export const Alert = ({className, variant = "", icon = "", text = "", children, ...props}) => {
    const alertClassName = classNames({
        "rounded-xl shadow-sm border p-3 flex gap-2 items-center": true,
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
