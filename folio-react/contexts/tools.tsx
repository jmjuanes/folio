import React from "react";
import { TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.jsx";
export enum TOOL_TYPE {
    CORE = "core_tool",
    PRIMITIVE = "primitive_tool",
    COMPOSITE = "composite_tool",
    OVERLAY = "overlay_tool",
};

export type Tool = {
    id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    primary?: boolean;
    type: TOOL_TYPE;
    enabledOnReadOnly?: boolean;
    keyboardShortcut?: string;

    // lifecycle
    onActivate?: (editor: any, tool: Tool) => void;
    onDeactivate?: (editor: any, tool: Tool) => void;

    // event handlers
    onPointCanvas?: (editor: any, tool: Tool, event: any) => void;
    onPointElement?: (editor: any, tool: Tool, event: any) => void;
    onPointerDown?: (editor: any, tool: Tool, event: any) => void;
    onPointerMove?: (editor: any, tool: Tool, event: any) => void;
    onPointerUp?: (editor: any, tool: Tool, event: any) => void;
    onDoubleClickElement?: (editor: any, tool: Tool, event: any) => void;
    onKeyDown?: (editor: any, tool: Tool, event: any) => void;
    onElementChange?: (editor: any, tool: Tool, event: any) => void;
    onElementBlur?: (editor: any, tool: Tool, event: any) => void;

    // UI rendering
    renderToolbar?: (editor: any, tool: Tool, update: () => void) => React.ReactNode;
    renderCanvas?: (editor: any, tool: Tool) => React.ReactNode;
};

export type ToolsManager = {
    getTools: () => Tool[];
    getToolById: (toolId: string) => Tool | null;
    getToolByShortcut: (shortcut: string) => Tool | null;
    getActiveTool: () => Tool;
    setActiveTool: (toolId: string) => void;
    getLocked: () => boolean;
    setLocked: (toolLocked: boolean) => void;
};

export type ToolsProviderProps = {
    tools: Tool[];
    children: React.ReactNode;
};

// context to manage tools
export const ToolsContext = React.createContext<[ToolsManager, number] | null>(null);

// @description hook to access to all tools
export const useTools = (): ToolsManager => {
    const tools = React.useContext(ToolsContext);
    if (!tools) {
        throw new Error("Cannot call 'useTools' outside <ToolsProvider>.");
    }
    return tools[0];
};

// tools provider
export const ToolsProvider = (props: ToolsProviderProps): React.JSX.Element => {
    const editor = useEditor();
    const [update, setUpdate] = React.useState<number>(1);
    const activeTool = React.useRef<string>(TOOLS.SELECT);
    const locked = React.useRef<boolean>(false);

    const tools = props.tools;

    // @description get list of tools
    const getTools = React.useCallback((): Tool[] => tools, [tools]);

    // @description get a tool by id
    const getToolById = React.useCallback((toolId: string): Tool | null => {
        return tools.find(tool => tool.id === toolId) || null;
    }, [tools]);

    // @description get tool by the provided shortcut
    const getToolByShortcut = React.useCallback((shortcut: string = ""): Tool | null => {
        const uppercaseShortcut = shortcut.toUpperCase();
        return tools.find((tool: Tool) => {
            return !!tool?.keyboardShortcut && tool.keyboardShortcut.toUpperCase() === uppercaseShortcut;
        }) || null;
    }, [tools]);

    // @description get the active tool
    const getActiveTool = React.useCallback((): Tool => {
        return tools.find(tool => tool.id === activeTool.current) || tools[0];
    }, [tools]);

    // @description set the active tool by id
    const setActiveTool = React.useCallback((toolId: string) => {
        const newTool = getToolById(toolId);
        if (newTool) {
            // call onDeactivate on the current tool
            const currentTool = getActiveTool();
            if (currentTool && currentTool.id !== toolId) {
                currentTool.onDeactivate?.(editor, currentTool);
            }
            // update the active tool
            activeTool.current = toolId;
            // call onActivate on the new tool
            newTool.onActivate?.(editor, newTool);
            // trigger re-render
            setUpdate(prevUpdate => (-1) * prevUpdate);
        }
    }, [setUpdate, getToolById, getActiveTool, editor]);

    // @description get if the tool is locked
    const getLocked = React.useCallback((): boolean => locked.current, []);

    // @description set if the tools are locked
    const setLocked = React.useCallback((isLocked: boolean) => {
        locked.current = !!isLocked;
        setUpdate(prevUpdate => (-1) * prevUpdate);
    }, [setUpdate]);

    // build the tools manager api
    const toolsManager = React.useMemo<ToolsManager>(() => ({
        getTools: getTools,
        getToolById: getToolById,
        getToolByShortcut: getToolByShortcut,
        getActiveTool: getActiveTool,
        setActiveTool: setActiveTool,
        getLocked: getLocked,
        setLocked: setLocked,
    }), [tools, update]);

    // used to track the current page id
    const currentPageId = React.useRef(editor.page.id);

    // reset the current tool when we change the current page or the readonly state
    React.useEffect(() => {
        // case 1: page is now in readonly mode and we have an edit tool selected
        if (editor.page.readonly && !(activeTool.current === TOOLS.DRAG || activeTool.current === TOOLS.POINTER)) {
            setActiveTool(TOOLS.DRAG)
        }
        // case 2: we have changed to a new page
        if (!editor.page.readonly && currentPageId.current !== editor.page.id) {
            setActiveTool(TOOLS.SELECT);
        }
        // make sure that we update the current page id reference
        currentPageId.current = editor.page.id;
    }, [setActiveTool, editor.page.id, editor.page.readonly]);

    return (
        <ToolsContext.Provider value={[toolsManager, update]}>
            {props.children}
        </ToolsContext.Provider>
    );
};
