
export type Tool = {
    id: string;
    state: Record<string, any>;
    enabledOnReadonly?: boolean;
    onEnter?: (editor: any, tool: Tool) => void;
    onExit?: (editor: any, tool: Tool) => void;
    onPointCanvas?: (editor: any, tool: Tool, event: any) => void;
    onPointElement?: (editor: any, tool: Tool, event: any) => void;
    onPointerDown?: (editor: any, tool: Tool, event: any) => void;
    onPointerMove?: (editor: any, tool: Tool, event: any) => void;
    onPointerUp?: (editor: any, tool: Tool, event: any) => void;
};
