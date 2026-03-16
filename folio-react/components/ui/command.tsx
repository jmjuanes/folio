import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import { printShortcut } from "../../utils/shortcuts.ts";

export type CommandContentProps = {
    className?: string;
    children: React.ReactNode;
};

export type CommandInputProps = {
    className?: string;
    value?: string;
    placeholder?: string;
    focus?: boolean;
    onChange?: (value: string) => void;
};

export type CommandListProps = {
    className?: string;
    children: React.ReactNode;
};

export type CommandGroupProps = {
    className?: string;
    children: React.ReactNode;
};

export type CommandItemProps = {
    className?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
};

export type CommandShortcutProps = {
    className?: string;
    shortcut: string | string[];
};

export type CommandEmptyProps = {
    className?: string;
    children: React.ReactNode;
};

export type CommandComponents = {
    Content: (props: CommandContentProps) => React.JSX.Element;
    Input: (props: CommandInputProps) => React.JSX.Element;
    List: (props: CommandListProps) => React.JSX.Element;
    Group: (props: CommandGroupProps) => React.JSX.Element;
    Item: (props: CommandItemProps) => React.JSX.Element;
    Shortcut: (props: CommandShortcutProps) => React.JSX.Element;
    Empty: (props: CommandEmptyProps) => React.JSX.Element;
};

export const Command: CommandComponents = {
    Content: (props: CommandContentProps): React.JSX.Element => (
        <div className={classNames("w-full flex flex-col gap-2", props.className)}>
            {props.children}
        </div>
    ),
    Input: (props: CommandInputProps): React.JSX.Element => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        // automatically focus the input when the component is mounted or when the focus prop changes to true
        React.useEffect(() => {
            if (props.focus) {
                inputRef.current?.focus();
            }
        }, [props.focus]);
        return (
            <div className="flex items-center gap-2 p-2 border-1 border-gray-200 rounded-lg">
                <div className="flex text-lg opacity-80">
                    {renderIcon("search")}
                </div>
                <input
                    type="text"
                    ref={inputRef}
                    defaultValue={props.value}
                    className="bg-transparent border-none outline-none text-sm w-full p-0"
                    placeholder={props.placeholder || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        if (typeof props.onChange === "function") {
                            props.onChange(event.target.value);
                        }
                    }}
                />
            </div>
        );
    },
    List: (props: CommandListProps): React.JSX.Element => (
        <div className={classNames("w-full max-h-72 overflow-y-auto flex flex-col gap-1", props.className)} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {props.children}
        </div>
    ),
    Group: (props: CommandGroupProps): React.JSX.Element => (
        <div className={classNames("font-bold text-2xs opacity-60 px-2", props.className)}>
            {props.children}
        </div>
    ),
    Item: (props: CommandItemProps): React.JSX.Element => {
        const itemClassName = classNames({
            "relative p-2 rounded-lg w-full shrink-0 flex flex-row flex-nowrap gap-2 text-sm items-center": true,
            "bg-white hover:bg-gray-100 cursor-pointer": !props.active && !props.disabled,
            "bg-gray-100": props.active,
            "opacity-60 cursor-not-allowed": props.disabled,
        }, props.className);
        return (
            <div className={itemClassName} onClick={props.onClick}>
                {props.children}
            </div>
        );
    },
    Shortcut: (props: CommandShortcutProps): React.JSX.Element => (
        <div className={classNames("ml-auto text-xs opacity-60", props.className)}>
            <span>{printShortcut(props.shortcut)}</span>
        </div>
    ),
    Empty: (props: CommandEmptyProps): React.JSX.Element => (
        <div className={classNames("p-6 text-center text-sm opacity-50", props.className)}>
            {props.children}
        </div>
    ),
};
