import React from "react";
import classNames from "classnames";
import { renderIcon, SparklesIcon } from "@josemi-icons/react";

export type AiPromptProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiPromptButtonProps = {
    className?: string;
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
};

export const Ai: any = {
    Prompt: (props: AiPromptProps): React.JSX.Element => (
        <div className={classNames("bg-gray-100 rounded-xl border-0 p-4", props.className)}>
            {props.children}
        </div>
    ),
    PromptButton: (props: AiPromptButtonProps): React.JSX.Element => {
        const buttonClassName = classNames({
            "border-0 flex items-center rounded-full p-2 text-lg": true,
            "bg-gray-950 hover:bg-gray-900 text-white": true,
            "cursor-pointer": !props.disabled,
            "opacity-60 cursor-not-allowed": !!props.disabled,
        }, props.className);
        return (
            <button className={buttonClassName} onClick={props.onClick}>
                {renderIcon(props.icon)}
            </button>
        );
    },
};
