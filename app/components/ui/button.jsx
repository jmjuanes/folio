import React from "react";
import classNames from "classnames";
import {themed} from "../../contexts/theme.jsx";

export const Button = ({className, disabled, variant = "primary", ...props}) => (
    <button
        data-testid="button"
        disabled={!!disabled}
        className={themed({
            "flex items-center justify-center gap-2 select-none p-3 rounded-lg": true,
            "button.primary": variant === "primary",
            "button.secondary": variant === "secondary",
            "cursor-pointer": !disabled,
            "opacity-60 cursor-not-allowed": disabled,
        }, className)}
        {...props}
    />
);
