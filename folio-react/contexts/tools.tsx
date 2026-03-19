import React from "react";
import { fileOpen } from "browser-fs-access";
import { SquareIcon, CircleIcon, TriangleIcon } from "@josemi-icons/react";
import {
    ELEMENTS,
    TOOLS,
    FIELDS,
    SHAPES,
    ARROW_SHAPES,
    STICKERS,
    ARROWHEADS,
    STROKE_WIDTHS,
    FORM_OPTIONS,
    FILE_EXTENSIONS,
} from "../constants.js";
import { STROKE_COLOR_PICK, TEXT_COLOR_PICK } from "../utils/colors.js";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../components/icons.jsx";
import { useEditor } from "../contexts/editor.jsx";
import { getStickerImage } from "../lib/stickers.js";
import { blobToDataUrl } from "../utils/blob.js";

export enum TOOL_TYPE {
    CORE = "core_tool",
    PRIMITIVE = "primitive_tool",
    COMPOSITE = "composite_tool",
    OVERLAY = "overlay_tool"
};

export type ToolPickValue = {
    value: any;
    icon?: React.JSX.Element | React.ReactNode;
};

export type ToolPick = {
    type: string;
    className?: string;
    values: string[] | ToolPickValue[];
};

export type ToolPicks = {
    [pickField: string]: ToolPick;
};

export type Tool = {
    id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    primary?: boolean;
    type: TOOL_TYPE;
    enabledOnReadOnly?: boolean;
    keyboardShortcut?: string;
    quickPicks?: ToolPicks;
    onSelect?: (editor: ReturnType<typeof useEditor>) => void;
    onQuickPickChange?: (defaults: Record<string, any>, field: string, value: any) => void;
};

export type ToolsManager = {
    getTools: () => Tool[];
    getToolById: (toolId: string) => Tool | null;
    getToolByShortcut: (toolId: string) => Tool | null;
    getActiveTool: () => Tool;
    setActiveTool: (toolId: string) => void;
    getLocked: () => boolean;
    setLocked: (toolLocked: boolean) => void;
};

export type ToolsProviderProps = {
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
    // const [activeTool, setActiveTool] = React.useState<string>(TOOLS.SELECT);
    // const [locked, setLocked] = React.useState<boolean>(false);

    const tools = React.useMemo<Tool[]>(() => Object.values({
        [TOOLS.SELECT]: {
            id: TOOLS.SELECT,
            type: TOOL_TYPE.CORE,
            name: "Select",
            icon: "pointer",
            primary: true,
            keyboardShortcut: "v",
        },
        [TOOLS.DRAG]: {
            id: TOOLS.DRAG,
            type: TOOL_TYPE.CORE,
            name: "Drag",
            icon: "hand-grab",
            enabledOnReadOnly: true,
            primary: true,
            keyboardShortcut: "h",
        },
        [TOOLS.POINTER]: {
            id: TOOLS.POINTER,
            type: TOOL_TYPE.OVERLAY,
            icon: "laser-pointer",
            name: "Laser Pointer",
            enabledOnReadOnly: true,
            keyboardShortcut: "l",
        },
        [TOOLS.ERASER]: {
            id: TOOLS.ERASER,
            type: TOOL_TYPE.CORE,
            icon: "erase",
            name: "Erase",
            keyboardShortcut: "e",
        },
        [ELEMENTS.SHAPE]: {
            id: ELEMENTS.SHAPE,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "square",
            name: "Shape",
            primary: true,
            keyboardShortcut: "s",
            quickPicks: {
                [FIELDS.SHAPE]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-32 gap-1",
                    values: [
                        { value: SHAPES.RECTANGLE, icon: <SquareIcon /> },
                        { value: SHAPES.ELLIPSE, icon: <CircleIcon /> },
                        { value: SHAPES.TRIANGLE, icon: <TriangleIcon /> },
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
        },
        [ELEMENTS.ARROW]: {
            id: ELEMENTS.ARROW,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "arrow-up-right",
            name: "Arrow",
            primary: true,
            keyboardShortcut: "a",
            quickPicks: {
                // [FIELDS.END_ARROWHEAD]: {
                //     type: FORM_OPTIONS.SELECT,
                //     className: "flex flex-nowrap w-24 gap-1",
                //     isActive: (value, currentValue, data) => {
                //         return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                //     },
                //     values: [
                //         {value: ARROWHEADS.NONE, icon: <LineIcon />},
                //         {value: ARROWHEADS.ARROW, icon: <ArrowIcon />},
                //     ],
                // },
                [FIELDS.ARROW_SHAPE]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    // isActive: (value, currentValue, data) => {
                    //     return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                    // },
                    values: [
                        { value: ARROW_SHAPES.LINE, icon: <ArrowIcon /> },
                        { value: ARROW_SHAPES.CONNECTOR, icon: <ArrowConnectorIcon /> },
                    ],
                },
                [FIELDS.STROKE_WIDTH]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    values: [
                        { value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon /> },
                        { value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon /> },
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
            onQuickPickChange: (defaults: any, field: string, value: any) => {
                // Make sure that we remove the start arrowhead value
                if (field === FIELDS.END_ARROWHEAD) {
                    defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
                }
            },
        },
        [ELEMENTS.TEXT]: {
            id: ELEMENTS.TEXT,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "text",
            name: "Text",
            primary: true,
            keyboardShortcut: "t",
            quickPicks: {
                // [FIELDS.TEXT_SIZE]: {
                //     type: FORM_OPTIONS.SELECT,
                //     className: "flex flex-nowrap w-24 gap-1",
                //     values: [
                //         {value: TEXT_SIZES.MEDIUM, icon: <WidthSmallIcon />},
                //         {value: TEXT_SIZES.XLARGE, icon: <WidthLargeIcon />},
                //     ],
                // },
                [FIELDS.TEXT_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: TEXT_COLOR_PICK,
                },
            },
        },
        [ELEMENTS.DRAW]: {
            id: ELEMENTS.DRAW,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "pen",
            name: "Draw",
            primary: true,
            keyboardShortcut: "d",
            quickPicks: {
                [FIELDS.STROKE_WIDTH]: {
                    type: FORM_OPTIONS.SELECT,
                    className: "flex flex-nowrap w-24 gap-1",
                    values: [
                        { value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon /> },
                        { value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon /> },
                    ],
                },
                [FIELDS.STROKE_COLOR]: {
                    type: FORM_OPTIONS.COLOR_SELECT,
                    className: "flex flex-nowrap w-48 gap-1",
                    values: STROKE_COLOR_PICK,
                },
            },
        },
        [ELEMENTS.IMAGE]: {
            id: ELEMENTS.IMAGE,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "image",
            name: "Image",
            keyboardShortcut: "i",
            onSelect: () => {
                // first we have to make sure that no elements have been selected
                editor.getElements().forEach((element: any) => {
                    element.selected = false;
                    element.editing = false;
                });
                const options = {
                    description: "Folio Board",
                    extensions: [
                        FILE_EXTENSIONS.PNG,
                        FILE_EXTENSIONS.JPG,
                    ],
                    multiple: false,
                };
                fileOpen(options)
                    .then(blob => blobToDataUrl(blob))
                    .then(data => editor.addImageElement(data))
                    .then(() => {
                        editor.dispatchChange();
                        editor.update();
                    })
                    .catch(error => console.error(error));
            },
        },
        [ELEMENTS.STICKER]: {
            id: ELEMENTS.STICKER,
            type: TOOL_TYPE.PRIMITIVE,
            icon: "sticker",
            name: "Sticker",
            primary: true,
            keyboardShortcut: "k",
            quickPicks: {
                [FIELDS.STICKER]: {
                    type: FORM_OPTIONS.IMAGE_SELECT,
                    className: "w-72 grid grid-cols-8 gap-1",
                    values: Object.values(STICKERS).map(stickerName => ({
                        value: stickerName,
                        image: getStickerImage(stickerName),
                    })),
                },
            },
        },
        [ELEMENTS.NOTE]: {
            id: ELEMENTS.NOTE,
            type: TOOL_TYPE.PRIMITIVE,
            name: "Note",
            icon: "note",
            keyboardShortcut: "n",
        },
    }), [editor]);

    // @description get list of tools
    const getTools = React.useCallback((): Tool[] => tools, [tools]);

    // @description get a tool by id
    const getToolById = React.useCallback((toolId: string): Tool | null => {
        return tools.find(tool => tool.id === toolId) || null;
    }, [tools]);

    // @description get tool by the provided shortcut
    // @param {string} shortcut - shortcut key
    // @returns {object} - tool configuration
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
        editor.getElements().forEach((element: any) => {
            element.selected = false;
            element.editing = false;
        });
        const tool = getToolById(toolId);
        if (tool) {
            // check if this tool has a custom onSelect method to execute
            if (typeof tool?.onSelect === "function") {
                tool.onSelect(editor);
            }
            else {
                activeTool.current = toolId; // TODO: check if this tool exists in the array of tools
                setUpdate(prevUpdate => (-1) * prevUpdate);
            }
        }
    }, [setUpdate, getToolById, editor]);

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
    }), [tools]);

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
