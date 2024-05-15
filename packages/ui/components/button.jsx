import React from "react";
import classNames from "classnames";

export const Button = ({className, disabled, variant = "primary", ...props}) => (
    <button
        data-testid="button"
        disabled={!!disabled}
        className={classNames({
            "flex items-center justify-center gap-2 select-none p-3 rounded-lg": true,
            "bg-neutral-950 hover:bg-neutral-900 text-white text-sm": variant === "primary",
            "bg-white text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-sm": variant === "secondary",
            "cursor-pointer": !disabled,
            "opacity-60 cursor-not-allowed": disabled,
        }, className)}
        {...props}
    />
);
