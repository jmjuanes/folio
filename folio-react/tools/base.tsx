import React from "react";
import { CanvasEvent } from "../components/canvas.tsx";

export abstract class BaseTool {
    abstract id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    primary?: boolean;
    enabledOnReadOnly?: boolean;
    shortcut?: string;

    // lifecycle
    onEnter?(editor: any): void;
    onExit?(editor: any): void;

    // event handlers
    onPointerDown?(editor: any, event: CanvasEvent): void;
    onPointerMove?(editor: any, event: CanvasEvent): void;
    onPointerUp?(editor: any, event: CanvasEvent): void;
    onDoubleClickElement?(editor: any, event: CanvasEvent): void;
    onKeyDown?(editor: any, event: any): boolean | void;
    onKeyUp?(editor: any, event: any): void;

    // UI rendering
    renderToolbar?(editor: any): React.ReactNode;
    renderCanvas?(editor: any): React.ReactNode;
}
