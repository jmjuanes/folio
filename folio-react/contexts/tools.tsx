import React from "react";
import { TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.jsx";
import { BaseTool } from "../tools/base.tsx";
import { defaultTools } from "../tools/index.tsx";

export type ToolsManager = {
    getTools: () => BaseTool[];
    getToolById: (toolId: string) => BaseTool | null;
    getToolByShortcut: (shortcut: string) => BaseTool | null;
    getActiveTool: () => BaseTool;
    setActiveTool: (toolId: string) => void;
    getLocked: () => boolean;
    setLocked: (toolLocked: boolean) => void;
};

export type ToolsProviderProps = {
    tools?: any[];
    children: React.ReactNode;
};

// context to manage tools
export const ToolsContext = React.createContext<ToolsManager | null>(null);

// @description hook to access to all tools
export const useTools = (): ToolsManager => {
    const tools = React.useContext(ToolsContext);
    if (!tools) {
        throw new Error("Cannot call 'useTools' outside <ToolsProvider>.");
    }
    return tools;
};

// tools provider
export const ToolsProvider = (props: ToolsProviderProps): React.JSX.Element => {
    const editor = useEditor();
    
    // Register tools in the editor on mount or when tools prop changes
    React.useLayoutEffect(() => {
        editor.registerTools(props.tools || defaultTools);
    }, [props.tools, editor]);

    // build the tools manager api
    const toolsManager = React.useMemo<ToolsManager>(() => ({
        // @description get list of tools
        getTools: () => Object.values(editor.tools) as BaseTool[],
        
        // @description get a tool by id
        getToolById: (toolId: string) => (editor.tools[toolId] as BaseTool) || null,
        
        // @description get tool by the provided shortcut
        getToolByShortcut: (shortcut: string) => {
            const uppercaseShortcut = (shortcut || "").toUpperCase();
            return (Object.values(editor.tools) as BaseTool[]).find(tool => {
                return !!tool?.shortcut && tool.shortcut.toUpperCase() === uppercaseShortcut;
            }) || null;
        },
        
        // @description get the active tool
        getActiveTool: () => editor.activeTool as BaseTool,
        
        // @description set the active tool by id
        setActiveTool: (toolId: string) => editor.setCurrentTool(toolId),
        
        // @description get if the tool is locked
        getLocked: () => !!editor.state.toolLocked,
        
        // @description set if the tools are locked
        setLocked: (isLocked: boolean) => editor.setToolLocked(isLocked),
    }), [editor]);

    // used to track the current page id
    const currentPageId = React.useRef(editor.page.id);

    // reset the current tool when we change the current page or the readonly state
    React.useEffect(() => {
        const availableTools = toolsManager.getTools();
        
        // case 1: page is now in readonly mode
        if (editor.page.readonly) {
            const readonlyTools = availableTools.filter(tool => !!tool.enabledOnReadOnly);
            // check if the current active tool is a readonly tool
            if (!readonlyTools.some(tool => tool.id === editor.state.tool && readonlyTools.length > 0)) {
                editor.setCurrentTool(readonlyTools[0]?.id || TOOLS.SELECT);
            }
        }
        // case 2: we have changed to a new page
        else if (currentPageId.current !== editor.page.id) {
            const defaultTool = availableTools.find(tool => (tool as any).default) || availableTools[0];
            if (defaultTool) {
                editor.setCurrentTool(defaultTool.id);
            }
        }
        // make sure that we update the current page id reference
        currentPageId.current = editor.page.id;
    }, [editor.page.id, editor.page.readonly, editor.state.tool, toolsManager]);

    return (
        <ToolsContext.Provider value={toolsManager}>
            {props.children}
        </ToolsContext.Provider>
    );
};
