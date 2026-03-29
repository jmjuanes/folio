import type { EditorPointEvent, EditorKeyboardEvent } from "./events.ts";

export interface ToolStateConstructor {
    new(editor: any, parent?: ToolState | null): ToolState;
    id?: string;
    initial?: string;
}

export class ToolState {
    id: string = "";
    editor: any;
    parent: ToolState | null;
    children: Record<string, ToolStateConstructor> = {};
    states: Record<string, ToolState> = {};
    activeStateId: string | null = null;

    constructor(editor: any, parent: ToolState | null = null) {
        this.editor = editor;
        this.parent = parent;
    }

    // lifecycle methods
    onEnter(params?: any): void { }
    onExit(): void { }

    // get the active state
    getActiveState(): ToolState | null {
        if (this.activeStateId) {
            return this.states[this.activeStateId];
        }
        return null;
    }

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
        }
        // execute the onEnter callback even if we are transitioning to the same state
        // this is needed to update the internals of the state
        this.activeStateId = nextId; // Update state ID before entering
        this.states[nextId]?.onEnter(params);

        // check if we have to enter into a substate
        if (path.length > 0) {
            this.states[nextId]?.transition(path.join("."), params);
        }
    }

    // handle calling the specified event
    dispatch(name: string, info: any): void {
        // 1. handle event in children states
        if (this.activeStateId && this.states[this.activeStateId]) {
            return this.states[this.activeStateId].dispatch(name, info);
        }

        // 2. handle event in this state
        const handlerName = "on" + name.charAt(0).toUpperCase() + name.slice(1);
        if (typeof (this as any)[handlerName] === "function") {
            return (this as any)[handlerName](info);
        }
    }

    // alias to dispatch (TO_REMOVE)
    handleEvent(name: string, info: any): void {
        return this.dispatch(name, info);
    }

    // event handlers (to be overridden)
    onPointerDown?(event: EditorPointEvent): void;
    onPointerMove?(event: EditorPointEvent): void;
    onPointerUp?(event: EditorPointEvent): void;
    onDoubleClick?(event: EditorPointEvent): void;
    onKeyDown?(event: EditorKeyboardEvent): void;
    onKeyUp?(event: EditorKeyboardEvent): void;
};
