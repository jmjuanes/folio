import React from "react";
import {themed} from "../../contexts/theme.jsx";

export const Button = ({className, disabled, variant = "primary", ...props}) => (
    <button
        data-testid="button"
        disabled={!!disabled}
        className={themed({
            "flex items-center justify-center gap-2 select-none px-4 py-2 rounded-lg font-medium": true,
            "button.primary": variant === "primary",
            "button.secondary": variant === "secondary",
            "cursor-pointer": !disabled,
            "opacity-60 cursor-not-allowed": disabled,
        }, className)}
        {...props}
    />
);
