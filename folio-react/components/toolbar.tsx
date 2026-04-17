import React from "react";
import classNames from "classnames";
import { LockIcon, UnlockIcon, renderIcon } from "@josemi-icons/react";
import { useEditor } from "../contexts/editor.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useContextMenu } from "../hooks/use-context-menu.tsx";
import { useTools } from "../contexts/tools.tsx";
import { useActions } from "../contexts/actions.tsx";
import { PanelOutlet, usePanels } from "../contexts/panels.tsx";
import { ACTIONS, TOOLS, ELEMENTS } from "../constants.js";

import type { ToolState } from "../lib/tool.ts";
import type { ElementTool } from "../tools/element.ts";
import type { ToolItem } from "../contexts/tools.tsx";

export type ToolbarButtonProps = {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    icon?: any;
    text?: string;
    className?: string;
};

export const ToolbarButton = (props: ToolbarButtonProps): React.JSX.Element => {
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

export type ToolbarToolButtonProps = {
    tool: string;
};

export const ToolbarToolButton = (props: ToolbarToolButtonProps): React.JSX.Element | null => {
    const editor = useEditor();
    const { getToolById } = useTools();
    const { hidePanel } = usePanels();
    const activeTool = editor.getCurrentTool() as ToolState | null;
    const activeElementTye = activeTool?.id === TOOLS.ELEMENT ? (activeTool as ElementTool).getElementType?.() : null;
    const tool = React.useMemo<ToolItem | null>(() => getToolById(props.tool), [getToolById, props.tool]);
    const toolActive = React.useMemo<boolean>(() => {
        return props.tool === activeTool?.id || props.tool === activeElementTye;
    }, [props.tool, activeTool, activeElementTye]);

    if (!tool) {
        return null;
    }

    return (
        <ToolbarButton
            text={tool.name}
            icon={tool.icon}
            active={toolActive}
            disabled={editor.page.readonly && !tool.allowedInReadonly}
            onClick={() => {
                hidePanel("toolbar");
                tool.onSelect();
            }}
        />
    );
};

// @description Toolbar panel component
export const ToolbarContent = (): React.JSX.Element => {
    const editor = useEditor();
    const { hideContextMenu } = useContextMenu();
    const { dispatchAction } = useActions();

    const activeTool: ToolState | null = editor.getCurrentTool();
    const locked = editor.getToolLocked();

    const prevSelectedTool = React.useRef<string | null>(activeTool?.id || null);

    // when a tool is selected, make sure to hide the context menu
    React.useEffect(() => {
        if (prevSelectedTool.current !== activeTool?.id) {
            prevSelectedTool.current = activeTool?.id || null;
            hideContextMenu();
        }
    }, [activeTool?.id, hideContextMenu]);

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
                <ToolbarToolButton tool={TOOLS.DRAG} />
                <ToolbarToolButton tool={TOOLS.SELECT} />
                <ToolbarToolButton tool={ELEMENTS.SHAPE} />
                <ToolbarToolButton tool={ELEMENTS.ARROW} />
                <ToolbarToolButton tool={ELEMENTS.TEXT} />
                <ToolbarToolButton tool={ELEMENTS.DRAW} />
                <ToolbarToolButton tool={ELEMENTS.STICKER} />
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
    const editor = useEditor();
    const { Picks, Generate } = useEditorComponents();
    const content = props.children ?? <ToolbarContent />;

    return (
        <div className="flex flex-col justify-center items-center select-none">
            <PanelOutlet position="toolbar" />
            {!!Picks && (
                <Picks />
            )}
            {content}
        </div>
    );
};  
