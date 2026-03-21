import React from "react";
import { SquareIcon, CircleIcon, TriangleIcon } from "@josemi-icons/react";
import { fileOpen } from "browser-fs-access";
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
    GRID_SIZE,
    CHANGES,
} from "../constants.js";
import { STROKE_COLOR_PICK, TEXT_COLOR_PICK } from "../utils/colors.js";
import {
    getElementConfig,
    createElement,
} from "../lib/elements.js";
import { Form } from "../components/form/index.jsx";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../components/icons.jsx";
import { getStickerImage } from "../lib/stickers.js";
import { blobToDataUrl } from "../utils/blob.js";
import { BaseTool } from "./base.tsx";
import { CanvasEvent } from "../components/canvas.tsx";
import { SnapEdges } from "./children/snaps.tsx";
import { DimensionsLayer } from "./children/dimensions.tsx";

type ToolPickValue = {
    value: any;
    icon?: React.JSX.Element | React.ReactNode;
    image?: string;
};

type ToolPick = {
    type: string;
    className?: string;
    values: (string | ToolPickValue)[];
};

type ToolPicks = {
    [pickField: string]: ToolPick;
};

type PickPanelProps = {
    values: any;
    items: any;
    onChange: (field: string, value: any) => void;
};

export type ElementToolOptions = {
    icon?: string | React.ReactNode;
    name?: string;
    primary?: boolean;
    shortcut?: string;
    quickPicks?: ToolPicks;
    onQuickPickChange?: (defaults: Record<string, any>, field: string, value: any) => void;
    onSelect?: (editor: any) => void;
};

// @private get grid-snapped position
const getGridPosition = (editor: any, pos: number): number => {
    if (editor?.appState?.grid) {
        return Math.round(pos / GRID_SIZE) * GRID_SIZE;
    }
    return pos;
};

// @private remove a text element if it was just created and has no text
const removeTextElement = (editor: any, element: any) => {
    const history = editor.getHistory();
    if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
        history.shift();
    }
    editor.removeElements([element]);
    editor.dispatchChange();
};

const PickPanel = (props: PickPanelProps): React.JSX.Element => {
    const pickPanelClassName = [
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3",
        "bg-white border-1 border-gray-200 shadow-sm",
    ].join(" ");
    return (
        <div className={pickPanelClassName} style={{ transform: "translateX(-50%)" }}>
            <Form
                className="flex flex-row gap-2"
                data={props.values}
                items={props.items}
                separator={<div className="w-px h-6 bg-gray-200" />}
                onChange={props.onChange}
            />
        </div>
    );
};

export const createElementTool = (elementType: string, options: ElementToolOptions) => {
    return class ElementTool extends BaseTool {
        id = elementType;
        icon = options.icon;
        name = options.name;
        primary = options.primary;
        shortcut = options.shortcut;

        private activeElement: any = null;

        onEnter(editor: any) {
            // Clear any active editing state
            if (this.activeElement?.editing) {
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(editor, this.activeElement);
                }
                this.activeElement.editing = false;
                this.activeElement = null;
            }
        }

        onPointerDown(editor: any, event: CanvasEvent) {
            // If there's a custom onSelect (e.g., Image tool opens file dialog), call it instead
            if (typeof options.onSelect === "function") {
                options.onSelect(editor);
                return;
            }
            // Clean up any active editing element
            if (this.activeElement?.editing) {
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(editor, this.activeElement);
                }
                this.activeElement = null;
            }
            // Create the new element
            const element = createElement(elementType);
            const elementConfig = getElementConfig(element);
            Object.assign(element, {
                ...(elementConfig.initialize?.(editor.defaults) || {}),
                x1: getGridPosition(editor, event.originalX),
                y1: getGridPosition(editor, event.originalY),
                x2: getGridPosition(editor, event.originalX),
                y2: getGridPosition(editor, event.originalY),
                creating: true,
            });
            elementConfig.onCreateStart?.(element, event);
            this.activeElement = element;
            editor.clearSelection();
            editor.addElements([element]);
        }

        onPointerMove(editor: any, event: CanvasEvent) {
            if (!this.activeElement) return;
            const element = this.activeElement;
            element.x2 = getGridPosition(editor, event.currentX || event.originalX);
            element.y2 = getGridPosition(editor, event.currentY || event.originalY);
            getElementConfig(element)?.onCreateMove?.(element, event, (pos: number) => getGridPosition(editor, pos));
        }

        onPointerUp(editor: any, event: CanvasEvent) {
            if (!this.activeElement) return;
            const element = this.activeElement;
            element.creating = false;
            element.selected = true;
            element[FIELDS.VERSION] = 1;
            getElementConfig(element)?.onCreateEnd?.(element, event);

            // Patch the history to save the new element values
            const last = editor.page.history[0] || {};
            if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                last.elements[0].newValues = {
                    ...element,
                    selected: false,
                };
            }

            editor.dispatchChange();
            this.activeElement = null;

            // Switch back to select (unless tool is locked or it's a draw tool)
            const toolsManager = editor._toolsManager;
            if (toolsManager && !toolsManager.getLocked() && elementType !== ELEMENTS.DRAW) {
                toolsManager.setActiveTool(TOOLS.SELECT);
            }
            else if (toolsManager?.getLocked()) {
                element.selected = false;
            }

            // Special handling for text elements: enter edit mode
            if (element.type === ELEMENTS.TEXT) {
                element.editing = true;
                this.activeElement = element;
            }
        }

        // Render the quick picks toolbar panel
        renderToolbar(editor: any, update: () => void) {
            if (!options.quickPicks) return null;
            return (
                <PickPanel
                    values={editor.defaults}
                    items={options.quickPicks}
                    onChange={(field: string, value: any) => {
                        editor.defaults[field] = value;
                        if (typeof options.onQuickPickChange === "function") {
                            options.onQuickPickChange(editor.defaults, field, value);
                        }
                        update();
                    }}
                />
            );
        }

        renderCanvas(editor: any) {
            return (
                <React.Fragment>
                    {editor.appState.snapToElements && <SnapEdges edges={editor.state.snapEdges || []} />}
                    {editor.appState.objectDimensions && <DimensionsLayer />}
                </React.Fragment>
            );
        }
    };
};

export const ShapeTool = createElementTool(ELEMENTS.SHAPE, {
    icon: "square",
    name: "Shape",
    primary: true,
    shortcut: "s",
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
});

export const ArrowTool = createElementTool(ELEMENTS.ARROW, {
    icon: "arrow-up-right",
    name: "Arrow",
    primary: true,
    shortcut: "a",
    quickPicks: {
        [FIELDS.ARROW_SHAPE]: {
            type: FORM_OPTIONS.SELECT,
            className: "flex flex-nowrap w-24 gap-1",
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
    onQuickPickChange: (defaults, field, value) => {
        if (field === FIELDS.END_ARROWHEAD) {
            defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
        }
    },
});

export const TextTool = createElementTool(ELEMENTS.TEXT, {
    icon: "text",
    name: "Text",
    primary: true,
    shortcut: "t",
    quickPicks: {
        [FIELDS.TEXT_COLOR]: {
            type: FORM_OPTIONS.COLOR_SELECT,
            className: "flex flex-nowrap w-48 gap-1",
            values: TEXT_COLOR_PICK,
        },
    },
});

export const DrawTool = createElementTool(ELEMENTS.DRAW, {
    icon: "pen",
    name: "Draw",
    primary: true,
    shortcut: "d",
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
});

export const ImageTool = createElementTool(ELEMENTS.IMAGE, {
    icon: "image",
    name: "Image",
    shortcut: "i",
    onSelect: (editor: any) => {
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
            .then((blob: any) => blobToDataUrl(blob))
            .then((data: string) => editor.addImageElement(data))
            .then(() => {
                editor.dispatchChange();
                editor.update();
            })
            .catch((error: Error) => console.error(error));
    },
});

export const StickerTool = createElementTool(ELEMENTS.STICKER, {
    icon: "sticker",
    name: "Sticker",
    primary: true,
    shortcut: "k",
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
});

export const NoteTool = createElementTool(ELEMENTS.NOTE, {
    name: "Note",
    icon: "note",
    shortcut: "n",
});
