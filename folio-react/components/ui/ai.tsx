import React from "react";
import classNames from "classnames";
import { renderIcon, SparklesIcon } from "@josemi-icons/react";

export enum AiMessageRole {
    USER = "user",
    ASSISTANT = "assistant",
};

export type AiPromptProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiPromptInputProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    value?: string;
    onChange?: (value: string) => void;
};

export type AiPromptSubmitProps = {
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
};

export type AiPromptButtonProps = {
    className?: string;
    icon: string;
    text?: string;
    disabled?: boolean;
    onClick?: () => void;
};

export type AiConversationProps = {
    className?: string;
    scrollToTop?: boolean;
    children: React.ReactNode;
};

export type AiMessageProps = {
    className?: string;
    role: AiMessageRole;
    children: React.ReactNode;
};

export type AiMessageContentProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiArtifactProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiArtifactHeaderProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiArtifactTitleProps = {
    className?: string;
    title?: string;
    text?: string;
};

export type AiArtifactActionsProps = {
    className?: string;
    children: React.ReactNode;
};

export type AiArtifactActionProps = {
    className?: string;
    disabled?: boolean;
    icon: string;
    onClick?: () => void;
};

export type AiComponents = {
    Prompt: (props: AiPromptProps) => React.JSX.Element;
    PromptInput: (props: AiPromptInputProps) => React.JSX.Element;
    PromptSubmit: (props: AiPromptSubmitProps) => React.JSX.Element;
    PromptButton: (props: AiPromptButtonProps) => React.JSX.Element;
    Conversation: (props: AiConversationProps) => React.JSX.Element;
    Message: (props: AiMessageProps) => React.JSX.Element;
    MessageContent: (props: AiMessageContentProps) => React.JSX.Element;
    Artifact: (props: AiArtifactProps) => React.JSX.Element;
    ArtifactHeader: (props: AiArtifactHeaderProps) => React.JSX.Element;
    ArtifactTitle: (props: AiArtifactTitleProps) => React.JSX.Element;
    ArtifactActions: (props: AiArtifactActionsProps) => React.JSX.Element;
    ArtifactAction: (props: AiArtifactActionProps) => React.JSX.Element;
};

export const Ai: AiComponents = {
    Prompt: (props: AiPromptProps): React.JSX.Element => (
        <div className={classNames("bg-white border-1 border-gray-200 rounded-xl p-3", props.className)}>
            {props.children}
        </div>
    ),
    PromptInput: (props: AiPromptInputProps): React.JSX.Element => (
        <textarea
            disabled={!!props.disabled}
            placeholder={props.placeholder}
            rows={props?.rows ?? 4}
            value={props.value}
            onChange={event => props.onChange?.(event.target.value)}
            className={classNames("text-sm bg-transparent outline-none border-0 w-full p-0", props.className)}
            style={{ resize: "none" }}
        />
    ),
    PromptButton: (props: AiPromptButtonProps): React.JSX.Element => {
        const buttonClassName = classNames({
            "border-0 flex items-center gap-1 rounded-lg p-2 bg-transparent": true,
            "cursor-pointer hover:bg-gray-100": !props.disabled,
            "pointer-events-none opacity-60": props.disabled,
        }, props.className);
        return (
            <button className={buttonClassName} onClick={props.onClick}>
                <div className="text-lg flex items-center opacity-80">
                    {renderIcon(props.icon)}
                </div>
                {!!props.text && (
                    <div className="text-sm opacity-80">{props.text}</div>
                )}
            </button>
        );
    },
    PromptSubmit: (props: AiPromptSubmitProps): React.JSX.Element => {
        const buttonClassName = classNames({
            "border-0 flex items-center rounded-full p-2 text-lg": true,
            "bg-gray-950 hover:bg-gray-900 text-white": true,
            "cursor-pointer": !props.disabled,
            "opacity-60 cursor-not-allowed": !!props.disabled,
        }, props.className);
        return (
            <button className={buttonClassName} onClick={props.onClick}>
                {renderIcon("arrow-up")}
            </button>
        );
    },
    Conversation: (props: AiConversationProps): React.JSX.Element => {
        const scrollRef = React.useRef<HTMLDivElement>(null);
        React.useEffect(() => {
            if (props.scrollToTop && scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, [props.scrollToTop]);
        return (
            <div ref={scrollRef} className={classNames("flex flex-col gap-4 h-full min-h-0 overflow-y-scroll", props.className)}>
                {props.children}
            </div>
        );
    },
    Message: (props: AiMessageProps): React.JSX.Element => {
        const messageClassName = classNames({
            "flex flex-col w-full": true,
            "items-end": props.role === AiMessageRole.USER,
            "items-start": props.role === AiMessageRole.ASSISTANT,
        }, props.className);
        return (
            <div className={messageClassName} style={{ maxWidth: "95%" }}>
                {props.children}
            </div>
        );
    },
    MessageContent: (props: AiMessageContentProps): React.JSX.Element => (
        <div className={classNames("flex flex-col gap-1", props.className)}>
            {props.children}
        </div>
    ),
    Artifact: (props: AiArtifactProps): React.JSX.Element => (
        <div className={classNames("flex flex-col overflow-hidden rounded-xl border-1 border-gray-200", props.className)}>
            {props.children}
        </div>
    ),
    ArtifactHeader: (props: AiArtifactHeaderProps): React.JSX.Element => (
        <div className={classNames("flex items-center justify-between p-2 bg-gray-50 border-b-1 border-gray-200", props.className)}>
            {props.children}
        </div>
    ),
    ArtifactTitle: (props: AiArtifactTitleProps): React.JSX.Element => (
        <div className={classNames("text-sm font-bold", props.className)}>
            {props.text || props.title}
        </div>
    ),
    ArtifactActions: (props: AiArtifactActionsProps): React.JSX.Element => (
        <div className={classNames("flex items-center gap-1", props.className)}>
            {props.children}
        </div>
    ),
    ArtifactAction: (props: AiArtifactActionProps): React.JSX.Element => {
        const buttonClassName = classNames({
            "flex p-2 rounded-lg": true,
            "hover:bg-gray-100 cursor-pointer": !props.disabled,
            "opacity-60 cursor-not-allowed": !!props.disabled,
        }, props.className);
        return (
            <button className={buttonClassName} onClick={props.onClick}>
                <div className="flex items-center text-lg opacity-80">
                    {renderIcon(props.icon)}
                </div>
            </button>
        );
    },
};
