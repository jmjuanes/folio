import React from "react";
import classNames from "classnames";

export const Centered = ({className, ...props}) => (
    <div
        data-testid="centered"
        className={classNames(
            "w-full flex items-center justify-center top-0 left-0",
            className,
        )}
        {...props}
    />
);
