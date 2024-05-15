import React from "react";
import classNames from "classnames";

export const Overlay = ({className, ...props}) => (
    <div
        data-testid="overlay"
        className={classNames(
            "fixed w-full h-full top-0 left-0 opacity-90 backdrop-blur-md bg-white",
            className,
        )}
        {...props}
    />
);
