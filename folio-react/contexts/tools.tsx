import React from "react";
import { TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.jsx";

import { BaseTool } from "../tools/base.tsx";

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
    tools: any[];
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

    // Instantiate tools on mount and when tools prop changes
    const tools = React.useMemo(() => {
        return props.tools.map((ToolClass: any) => new ToolClass()) as BaseTool[];
    }, [props.tools, editor]);

    // @description get list of tools
    const getTools = React.useCallback((): BaseTool[] => tools, [tools]);

    // @description get a tool by id
    const getToolById = React.useCallback((toolId: string): BaseTool | null => {
        return tools.find(tool => tool.id === toolId) || null;
    }, [tools]);

    // @description get tool by the provided shortcut
    const getToolByShortcut = React.useCallback((shortcut: string = ""): BaseTool | null => {
        const uppercaseShortcut = shortcut.toUpperCase();
        return tools.find((tool: BaseTool) => {
            return !!tool?.shortcut && tool.shortcut.toUpperCase() === uppercaseShortcut;
        }) || null;
    }, [tools]);

    // @description get the active tool
    const getActiveTool = React.useCallback((): BaseTool => {
        return tools.find(tool => tool.id === activeTool.current) || tools[0];
    }, [tools]);

    // @description set the active tool by id
    const setActiveTool = React.useCallback((toolId: string) => {
        const newTool = getToolById(toolId);
        if (newTool) {
            // call onExit on the current tool
            const currentTool = getActiveTool();
            if (currentTool && currentTool.id !== toolId) {
                currentTool.onExit?.();
            }
            // update the active tool
            activeTool.current = toolId;
            // call onEnter on the new tool
            newTool.onEnter?.();
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
