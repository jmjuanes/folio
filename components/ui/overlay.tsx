import React, { HtmlHTMLAttributes } from "react";
import classNames from "classnames";

export enum OverlayVariant {
    WHITE = "white",
    BLACK = "black",
    TRANSPARENT = "transparent",
};

export type OverlayProps = HtmlHTMLAttributes<HTMLDivElement> & {
    className?: string;
    variant?: OverlayVariant;
};

export const Overlay = ({ className, variant, ...props }: OverlayProps): React.JSX.Element => (
    <div
        data-testid="overlay"
        className={classNames({
            "fixed w-full h-full top-0 left-0 backdrop-blur-md": true,
            "opacity-90 bg-white": variant === OverlayVariant.WHITE || !variant,
            "opacity-80 bg-black": variant === OverlayVariant.BLACK,
            "bg-transparent": variant === OverlayVariant.TRANSPARENT,
        }, className)}
        {...props}
    />
);
