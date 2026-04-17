import React from "react";
import classNames from "classnames";

export enum ButtonVariant {
    PRIMARY = "primary",
    SECONDARY = "secondary",
};

export type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    className?: string;
    disabled?: boolean;
    variant?: ButtonVariant | string;
};

export const Button = ({ className, disabled, variant, ...otherProps }: ButtonProps): React.JSX.Element => (
    <button
        data-testid="button"
        disabled={!!disabled}
        className={classNames({
            "flex items-center justify-center gap-2 select-none px-4 py-2 rounded-lg font-medium": true,
            "bg-gray-950 hover:bg-gray-900 text-white text-sm": !variant || variant === ButtonVariant.PRIMARY,
            "bg-white text-gray-900 hover:bg-gray-200 border-1 border-gray-200 text-sm": variant === ButtonVariant.SECONDARY,
            "cursor-pointer": !disabled,
            "opacity-60 cursor-not-allowed": disabled,
        }, className)}
        {...otherProps}
    />
);
