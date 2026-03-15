import React, { HtmlHTMLAttributes } from "react";
import classNames from "classnames";
import { CloseIcon } from "@josemi-icons/react";

export type DialogProps = HtmlHTMLAttributes<HTMLDivElement> & {
    className?: string;
    children?: React.ReactNode;
}; 

export type DialogComponents = {
    Content: (props: DialogProps) => React.JSX.Element;
    Title: (props: DialogProps) => React.JSX.Element;
    Description: (props: DialogProps) => React.JSX.Element;
    Close: (props: DialogProps) => React.JSX.Element;
    Header: (props: DialogProps) => React.JSX.Element;
    Body: (props: DialogProps) => React.JSX.Element;
    Footer: (props: DialogProps) => React.JSX.Element;
};

export const Dialog = {
    Content: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("bg-white border-1 border-gray-200 shadow-sm rounded-2xl", className)} {...props} />
    ),
    Title: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("font-bold text-lg text-gray-950", className)} {...props} />
    ),
    Description: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("text-sm opacity-80", className)} {...props} />
    ),
    Close: ({ className, ...props }: DialogProps): React.JSX.Element => {
        const closeContentClassName = classNames({
            "flex cursor-pointer text-2xl absolute top-0 right-0 mt-6 mr-5": true,
            "text-current opacity-60 hover:opacity-80": true,
        }, className)
        return (
            <div className={closeContentClassName} {...props}>
                <CloseIcon />
            </div>
        );
    },
    Header: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("flex flex-col select-none px-6 pt-6", className)} {...props} />
    ),
    Body: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("px-6 py-6", className)} {...props} />
    ),
    Footer: ({ className, ...props }: DialogProps): React.JSX.Element => (
        <div className={classNames("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pb-6", className)} {...props} />
    )
};
