import React from "react";
import classNames from "classnames";
import { LockIcon, UnlockIcon, renderIcon } from "@josemi-icons/react";
import { useEditor } from "../contexts/editor.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useContextMenu } from "../contexts/context-menu.jsx";
import { useTools } from "../contexts/tools.tsx";
import { useActions } from "../hooks/use-actions.js";
import { ACTIONS } from "../constants.js";

import { ToolState } from "../lib/tool.ts";
import type { ToolItem } from "../contexts/tools.tsx";

type ToolbarButtonProps = {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    icon?: any;
    text?: string;
    className?: string;
};

const ToolbarButton = (props: ToolbarButtonProps): React.JSX.Element => {
    const classList = classNames({
        "flex flex-col justify-center items-center px-4 py-2 gap-1 rounded-xl": true,
        "cursor-pointer": !props.active,
        "bg-gray-950 text-white": props.active,
        "hover:bg-gray-200": !props.active,
        "pointer-events-none opacity-60 cursor-not-allowed": props.disabled,
    }, props.className);

    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon && (
                <div className="text-xl flex items-center">
                    {typeof props.icon === "string" ? renderIcon(props.icon) : props.icon}
                </div>
            )}
            {props.text && (
                <div className="text-3xs">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

// @description Toolbar panel component
export const ToolbarContent = (): React.JSX.Element => {
    const editor = useEditor();
    const { getTools } = useTools();
    const contextMenu = useContextMenu() as any;
    const dispatchAction = useActions();

    const allTools: ToolItem[] = getTools();
    const activeTool: ToolState | null = editor.getCurrentTool();
    const locked = editor.getToolLocked();

    const prevSelectedTool = React.useRef<string | null>(activeTool?.id || null);

    const primaryTools = React.useMemo<ToolItem[]>(() => {
        return allTools;
    }, [allTools]);

    // when a tool is selected, make sure to hide the context menu
    React.useEffect(() => {
        if (prevSelectedTool.current !== activeTool?.id) {
            prevSelectedTool.current = activeTool?.id || null;
            contextMenu?.hideContextMenu?.();
        }
    }, [activeTool?.id, contextMenu]);

    const handleLockClick = React.useCallback(() => {
        editor.setToolLocked(!locked);
    }, [editor, locked]);

    const lockButtonClass = classNames({
        "absolute left-full flex items-center cursor-pointer text-lg rounded-full p-2 ml-2": true,
        "bg-gray-950 text-white": locked,
        "opacity-50 hover:opacity-100": !locked,
        "pointer-events-none opacity-40 cursor-not-allowed": editor.page.readonly,
    });

    return (
        <div className="flex items-center relative select-none">
            <div className="rounded-2xl items-center flex gap-2 p-1 border-1 border-gray-200 bg-white shadow-sm text-gray-900">
                {primaryTools.map(tool => (
                    <div key={tool.id} className="flex relative">
                        <ToolbarButton
                            text={tool.name}
                            icon={tool.icon}
                            active={activeTool?.id === tool.id}
                            disabled={editor.page.readonly && !tool.enabledOnReadOnly}
                            onClick={() => {
                                tool.onSelect();
                            }}
                        />
                    </div>
                ))}
                <ToolbarButton
                    text="Actions"
                    icon="tools"
                    onClick={() => {
                        dispatchAction(ACTIONS.SHOW_COMMANDS);
                    }}
                />
            </div>
            <div className={lockButtonClass} onClick={handleLockClick}>
                {locked ? <LockIcon /> : <UnlockIcon />}
            </div>
        </div>
    );
};

export const Toolbar = (props: { children: React.ReactNode }): React.JSX.Element => {
    const { Picks } = useEditorComponents();
    const content = props.children ?? <ToolbarContent />;

    return (
        <div className="flex flex-col justify-center items-center select-none">
            <Picks />
            {content}
        </div>
    );
};  
