import React from "react";
import classNames from "classnames";

export type CenteredProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
};

export const Centered = ({ className, ...props }: CenteredProps): React.JSX.Element => (
    <div
        data-testid="centered"
        className={classNames(
            "w-full flex items-center justify-center top-0 left-0",
            className,
        )}
        {...props}
    />
);
