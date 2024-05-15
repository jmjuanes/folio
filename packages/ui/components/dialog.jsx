import React from "react";
import classNames from "classnames";
import {CloseIcon} from "@josemi-icons/react";

export const Dialog = ({className, ...props}) => (
    <div
        data-testid="dialog"
        className={classNames(
            "w-full rounded-xl bg-white p-6 border border-neutral-200 shadow-sm",
            className,
        )}
        {...props}
    />
);

Dialog.Title = ({className, ...props}) => (
    <div
        data-testid="dialog-title"
        className={classNames("font-bold text-lg text-neutral-950", className)}
        {...props}
    />
);

Dialog.Description = ({className, ...props}) => (
    <div
        data-testid="dialog-description"
        className={classNames("text-sm text-neutral-700", className)}
        {...props}
    />
);

Dialog.Close = ({className, ...props}) => (
    <div
        data-testid="dialog-close"
        className={classNames(
            "flex cursor-pointer text-2xl text-neutral-500 hover:text-neutral-900",
            "absolute top-0 right-0 mt-3 mr-3",
            className,
        )}
        {...props}
    >
        <CloseIcon />
    </div>
);

Dialog.Header = ({className, ...props}) => (
    <div
        data-testid="dialog-header"
        className={classNames("flex flex-col select-none mb-2", className)}
        {...props}
    />
);

Dialog.Body = props => (
    <div data-testid="dialog-body" {...props} />
);

Dialog.Footer = ({className, ...props}) => (
    <div
        data-testid="dialog-footer"
        className={classNames(
            "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4",
            className,
        )}
        {...props}
    />
);
