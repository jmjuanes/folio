import React from "react";
import {CloseIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

export const Dialog = ({className, ...props}) => (
    <div
        data-testid="dialog"
        className={themed("w-full rounded-2xl px-6 pt-8 pb-6", "dialog", className)}
        {...props}
    />
);

Dialog.Title = ({className, ...props}) => (
    <div
        data-testid="dialog-title"
        className={themed("dialog.title", className)}
        {...props}
    />
);

Dialog.Description = ({className, ...props}) => (
    <div
        data-testid="dialog-description"
        className={themed("dialog.description", className)}
        {...props}
    />
);

Dialog.Close = ({className, ...props}) => (
    <div
        data-testid="dialog-close"
        className={themed("flex cursor-pointer text-xl absolute top-0 right-0 mt-3 mr-3", "dialog.close", className)}
        {...props}
    >
        <CloseIcon />
    </div>
);

Dialog.Header = ({className, ...props}) => (
    <div
        data-testid="dialog-header"
        className={themed("flex flex-col select-none mb-2", "dialog.header", className)}
        {...props}
    />
);

Dialog.Body = ({className, ...props}) => (
    <div
        data-testid="dialog-body"
        className={themed("dialog.body", className)}
        {...props}
    />
);

Dialog.Footer = ({className, ...props}) => (
    <div
        data-testid="dialog-footer"
        className={themed("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4", "dialog.footer", className)}
        {...props}
    />
);
