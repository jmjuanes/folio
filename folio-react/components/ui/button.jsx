import React from "react";
import classNames from "classnames";

export const Button = ({className, disabled, variant = "primary", ...props}) => (
    <button
        data-testid="button"
        disabled={!!disabled}
        className={classNames({
            "flex items-center justify-center gap-2 select-none px-4 py-2 rounded-lg font-medium": true,
            "bg-gray-950 hover:bg-gray-900 text-white text-sm": variant === "primary",
            "bg-white text-gray-900 hover:bg-gray-200 border-1 border-gray-200 text-sm": variant === "secondary",
            "cursor-pointer": !disabled,
            "opacity-60 cursor-not-allowed": disabled,
        }, className)}
        {...props}
    />
);
