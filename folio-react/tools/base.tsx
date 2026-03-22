import React from "react";
import type { CanvasEvent } from "../components/canvas.tsx";
import type { ToolsManager } from "../contexts/tools.tsx";

export type ToolLifecycleParams = {
    editor: any;
    tools: ToolsManager;
};

export type ToolEventParams = {
    editor: any;
    tools: ToolsManager;
    event: CanvasEvent | any;
};

export type ToolRenderingParams = {
    editor: any;
};

export abstract class BaseTool {
    abstract id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    primary?: boolean;
    enabledOnReadOnly?: boolean;
    shortcut?: string;

    // lifecycle
    onEnter?(params: ToolLifecycleParams): void;
    onExit?(params: ToolLifecycleParams): void;

    // event handlers
    onPointerDown?(params: ToolEventParams): void;
    onPointerMove?(params: ToolEventParams): void;
    onPointerUp?(params: ToolEventParams): void;
    onDoubleClick?(params: ToolEventParams): void;
    onKeyDown?(params: ToolEventParams): boolean | void;
    onKeyUp?(params: ToolEventParams): void;

    // UI rendering
    renderToolbar?(params: ToolRenderingParams): React.ReactNode;
    renderCanvas?(params: ToolRenderingParams): React.ReactNode;
}
