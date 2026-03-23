import React from "react";
import type { CanvasEvent } from "../components/canvas.tsx";

export interface StateNodeConstructor {
    new (editor: any, parent?: StateNode | null): StateNode;
    id?: string;
    initial?: string;
}

export class StateNode {
    editor: any;
    parent: StateNode | null;
    children: Record<string, StateNodeConstructor> = {};
    states: Record<string, StateNode> = {};
    activeStateId: string | null = null;

    constructor(editor: any, parent: StateNode | null = null) {
        this.editor = editor;
        this.parent = parent;
    }

    onEnter(info?: any): void {}
    onExit(): void {}

    transition(id: string, info?: any): void {
        const [nextId, ...path] = id.split(".");
        
        if (this.activeStateId !== nextId) {
            if (this.activeStateId) {
                this.states[this.activeStateId]?.onExit();
            }
            this.activeStateId = nextId;
            
            if (!this.states[nextId] && this.children[nextId]) {
                this.states[nextId] = new this.children[nextId](this.editor, this);
            }
            
            this.states[nextId]?.onEnter(info);
        }

        if (path.length > 0) {
            this.states[nextId]?.transition(path.join("."), info);
        }
    }

    handleEvent(name: string, info: any): boolean | void {
        if (this.activeStateId && this.states[this.activeStateId]) {
            return this.states[this.activeStateId].handleEvent(name, info);
        }
        
        const handlerName = "on" + name.charAt(0).toUpperCase() + name.slice(1);
        if (typeof (this as any)[handlerName] === "function") {
            return (this as any)[handlerName](info);
        }
    }

    // Default event handlers (to be overridden)
    onPointerDown?(info: CanvasEvent): void;
    onPointerMove?(info: CanvasEvent): void;
    onPointerUp?(info: CanvasEvent): void;
    onDoubleClick?(info: CanvasEvent): void;
    onKeyDown?(event: KeyboardEvent): boolean | void;
    onKeyUp?(event: KeyboardEvent): void;
}

export abstract class BaseTool extends StateNode {
    abstract id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    shortcut?: string;
    enabledOnReadOnly?: boolean;

}
