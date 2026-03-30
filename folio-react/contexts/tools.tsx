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
import { useEditor } from "../contexts/editor.tsx";
import { getStickerImage } from "../lib/stickers.js";
import { blobToDataUrl } from "../utils/blob.js";

export type PickValue = {
    value: any;
    icon?: React.JSX.Element | React.ReactNode;
    image?: string;
};

export type PickField = {
    type: string;
    className?: string;
    values: (string | PickValue)[];
};

export type ToolItem = {
    id: string;
    name?: string;
    icon?: React.JSX.Element | React.ReactNode | string;
    allowedInReadonly?: boolean;
    shortcut?: string;
    picks?: {
        [field: string]: PickField;
    };
    onSelect: () => void;
    onPickChange?: (defaults: Record<string, any>, field: string, value: any) => void;
};

export type ToolsOverrides = ToolItem[] | ((editor: any, defaultTools: ToolItem[]) => ToolItem[]);

export type ToolsProviderProps = {
    overrides?: ToolsOverrides;
    children: React.ReactNode;
};

export type ToolsManager = {
    getTools: () => ToolItem[],
    getToolById: (toolId: string) => ToolItem | null;
    getToolByShortcut: (shortcut: string) => ToolItem | null;
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
    const tools = React.useMemo<ToolItem[]>(() => {
        const defaultTools = Object.values({
            [TOOLS.DRAG]: {
                id: TOOLS.DRAG,
                name: "Drag",
                icon: "hand-grab",
                shortcut: "h",
                allowedInReadonly: true,
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.DRAG);
                    editor.update();
                },
            },
            [TOOLS.SELECT]: {
                id: TOOLS.SELECT,
                name: "Select",
                icon: "pointer",
                shortcut: "v",
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.SELECT);
                    editor.update();
                },
            },
            [TOOLS.POINTER]: {
                id: TOOLS.POINTER,
                icon: "laser-pointer",
                name: "Laser Pointer",
                allowedInReadonly: true,
                shortcut: "l",
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.POINTER);
                    editor.update();
                },
            },
            [TOOLS.ERASER]: {
                id: TOOLS.ERASER,
                icon: "erase",
                name: "Erase",
                shortcut: "e",
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ERASER);
                    editor.update();
                },
            },
            [ELEMENTS.SHAPE]: {
                id: ELEMENTS.SHAPE,
                icon: "square",
                name: "Shape",
                shortcut: "s",
                picks: {
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
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.SHAPE });
                    editor.update();
                },
            },
            [ELEMENTS.ARROW]: {
                id: ELEMENTS.ARROW,
                icon: "arrow-up-right",
                name: "Arrow",
                shortcut: "a",
                picks: {
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
                onPickChange: (defaults: any, field: string) => {
                    // Make sure that we remove the start arrowhead value
                    if (field === FIELDS.END_ARROWHEAD) {
                        defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
                    }
                },
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.ARROW });
                    editor.update();
                },
            },
            [ELEMENTS.TEXT]: {
                id: ELEMENTS.TEXT,
                icon: "text",
                name: "Text",
                shortcut: "t",
                picks: {
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
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.TEXT });
                    editor.update();
                },
            },
            [ELEMENTS.DRAW]: {
                id: ELEMENTS.DRAW,
                icon: "pen",
                name: "Draw",
                shortcut: "d",
                picks: {
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
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.DRAW });
                    editor.update();
                },
            },
            [ELEMENTS.IMAGE]: {
                id: ELEMENTS.IMAGE,
                icon: "image",
                name: "Image",
                shortcut: "i",
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
                icon: "sticker",
                name: "Sticker",
                shortcut: "k",
                picks: {
                    [FIELDS.STICKER]: {
                        type: FORM_OPTIONS.IMAGE_SELECT,
                        className: "w-72 grid grid-cols-8 gap-1",
                        values: Object.values(STICKERS).map(stickerName => ({
                            value: stickerName,
                            image: getStickerImage(stickerName),
                        })),
                    },
                },
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.STICKER });
                    editor.update();
                },
            },
            [ELEMENTS.NOTE]: {
                id: ELEMENTS.NOTE,
                name: "Note",
                icon: "note",
                shortcut: "n",
                onSelect: () => {
                    editor.setCurrentTool(TOOLS.ELEMENT, { type: ELEMENTS.NOTE });
                    editor.update();
                },
            },
        });
        // 1. check if the props.overrides is a function
        if (typeof props.overrides === "function") {
            return props.overrides(editor, defaultTools);
        }
        // 2. check if the props.overrides is an array
        if (!!props.overrides && Array.isArray(props.overrides)) {
            return props.overrides;
        }
        // 3. return the default tools
        return defaultTools;
    }, [editor, props.overrides]);

    // @description get a list of tools
    const getTools = React.useCallback(() => tools, [tools]);

    // @description get tool by id
    const getToolById = React.useCallback((toolId: string) => {
        return tools.find((tool: ToolItem) => tool?.id === toolId) || null;
    }, [tools]);

    // @description get tool by the provided shortcut
    const getToolByShortcut = React.useCallback((shortcut: string = ""): ToolItem | null => {
        const uppercaseShortcut = shortcut.toUpperCase();
        return tools.find((tool: ToolItem) => {
            return (tool?.shortcut || "").toUpperCase() === uppercaseShortcut;
        }) || null;
    }, [tools]);

    const toolsManager = React.useMemo<ToolsManager>(() => ({
        getTools: getTools,
        getToolById: getToolById,
        getToolByShortcut: getToolByShortcut,
    }), [tools]);

    return (
        <ToolsContext.Provider value={toolsManager}>
            {props.children}
        </ToolsContext.Provider>
    );
};
