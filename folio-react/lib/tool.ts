import type { EditorPointEvent, EditorKeyboardEvent } from "./events.ts";

export interface ToolNodeConstructor {
    new (editor: any, parent?: ToolNode | null): ToolNode;
    id?: string;
    initial?: string;
}

export class ToolNode {
    id: string = "";
    editor: any;
    parent: ToolNode | null;
    children: Record<string, ToolNodeConstructor> = {};
    states: Record<string, ToolNode> = {};
    activeStateId: string | null = null;

    constructor(editor: any, parent: ToolNode | null = null) {
        this.editor = editor;
        this.parent = parent;
    }

    // lifecycle methods
    onEnter(params?: any): void {}
    onExit(): void {}

    // manage transition between one state to another
    transition(id: string, params?: any): void {
        const [nextId, ...path] = id.split(".");
        
        // check if we have to change the active state id
        if (this.activeStateId !== nextId) {
            if (this.activeStateId) {
                this.states[this.activeStateId]?.onExit();
            }
            if (!this.states[nextId] && this.children[nextId]) {
                this.states[nextId] = new this.children[nextId](this.editor, this);
            }
            this.states[nextId]?.onEnter(params);
            this.activeStateId = nextId;
        }

        // check if we have to enter into a substate
        if (path.length > 0) {
            this.states[nextId]?.transition(path.join("."), params);
        }
    }

    // handle calling the specified event
    handleEvent(name: string, info: any): void {
        // 1. handle event in children states
        if (this.activeStateId && this.states[this.activeStateId]) {
            return this.states[this.activeStateId].handleEvent(name, info);
        }
        
        // 2. handle event in this state
        const handlerName = "on" + name.charAt(0).toUpperCase() + name.slice(1);
        if (typeof (this as any)[handlerName] === "function") {
            return (this as any)[handlerName](info);
        }
    }

    // event handlers (to be overridden)
    onPointerDown?(event: EditorPointEvent): void;
    onPointerMove?(event: EditorPointEvent): void;
    onPointerUp?(event: EditorPointEvent): void;
    onDoubleClick?(event: EditorPointEvent): void;
    onKeyDown?(event: EditorKeyboardEvent): void;
    onKeyUp?(event: EditorKeyboardEvent): void;
};
