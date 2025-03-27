import React from "react";
import cn from "classnames";
import {CloseIcon} from "@josemi-icons/react";

export const Dialog = ({className, ...props}) => (
    <div className={cn("bg-white border border-neutral-200 shadow-sm rounded-2xl", className)} {...props} />
);

Dialog.Title = ({className, ...props}) => (
    <div className={cn("font-bold text-lg text-neutral-950", className)} {...props} />
);

Dialog.Description = ({className, ...props}) => (
    <div className={cn("text-sm text-neutral-800", className)} {...props} />
);

Dialog.Close = ({className, ...props}) => (
    <div className={cn("flex cursor-pointer text-2xl absolute top-0 right-0 mt-6 mr-5 text-neutral-700 hover:text-neutral-900", className)} {...props}>
        <CloseIcon />
    </div>
);

Dialog.Header = ({className, ...props}) => (
    <div className={cn("flex flex-col select-none px-6 pt-6", className)} {...props} />
);

Dialog.Body = ({className, ...props}) => (
    <div className={cn("px-6 py-6", className)} {...props} />
);

Dialog.Footer = ({className, ...props}) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pb-6", className)} {...props} />
);
