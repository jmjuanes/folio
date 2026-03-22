import React from "react";
import { SquareIcon, CircleIcon, TriangleIcon } from "@josemi-icons/react";
import { fileOpen } from "browser-fs-access";
import {
    ELEMENTS,
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
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../components/icons.jsx";
import { getStickerImage } from "../lib/stickers.js";
import { blobToDataUrl } from "../utils/blob.js";
import { BaseTool } from "./base.tsx";
import { Dimensions } from "./children/dimensions.tsx";
import { PickPanel } from "./children/pick-panel.tsx";
import type { Picks } from "./children/pick-panel.tsx";
import type { ToolEventParams, ToolLifecycleParams, ToolRenderingParams } from "./base.tsx";

export type ElementDefaults = Record<string, any>;

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

export abstract class ElementTool extends BaseTool {
    abstract elementType: string;
    abstract elementPicks: Picks | null;
    public activeElement: any | null = null;
    
    // private listener to change quick picks
    onPickChange?(defaults: ElementDefaults, field: string, value: any): void;

    onEnter(params: ToolLifecycleParams) {
        this.activeElement = null;
    }

    onExit(params: ToolLifecycleParams) {
        // 1. if tool is locked, we have to reset selected elements
        // 2. if tool is not locked, change active tool to SELECT tool
        // !!tools.getLocked() ? editor.clearSelection() : tools.setActiveTool(TOOLS.SELECT);
        this.activeElement = null;
    }

    onPointerDown({ editor, event }: ToolEventParams) {
        // Create the new element
        const element = createElement(this.elementType);
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

    onPointerMove({ editor, event }: ToolEventParams) {
        if (this.activeElement) {
            const element = this.activeElement;
            const elementConfig = getElementConfig(element);
            element.x2 = getGridPosition(editor, event.currentX || event.originalX);
            element.y2 = getGridPosition(editor, event.currentY || event.originalY);
            elementConfig?.onCreateMove?.(element, event, (pos: number) => getGridPosition(editor, pos));
        }
    }

    onPointerUp({ editor, event, tools }: ToolEventParams) {
        if (this.activeElement) {
            const element = this.activeElement;
            element.creating = false;
            element.selected = true;
            element[FIELDS.VERSION] = 1;
            getElementConfig(element)?.onCreateEnd?.(element, event);

            // patch the history to save the new element values
            const last = editor.page.history[0] || {};
            if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                last.elements[0].newValues = {
                    ...element,
                    selected: false,
                };
            }

            // dispatch an editor change event
            editor.dispatchChange();
            // this.activeElement = null;

            // switch back to default tool (unless tool is locked)
            if (!tools.getLocked()) {
                tools.setDefaultToolActive();
                // tools.setActiveTool(TOOLS.SELECT);
            }
            else {
                element.selected = false;
            }
        }
    }

    // Render the quick picks toolbar panel
    renderToolbar({ editor }: ToolRenderingParams) {
        if (!this.elementPicks) {
            return null;
        }
        return (
            <PickPanel
                values={editor.defaults}
                items={this.elementPicks}
                onChange={(field: string, value: any) => {
                    editor.defaults[field] = value;
                    if (typeof this.onPickChange === "function") {
                        this.onPickChange(editor.defaults, field, value);
                    }
                    editor.update();
                }}
            />
        );
    }

    renderCanvas({ editor }: ToolRenderingParams) {
        return (
            <React.Fragment>
                {editor.appState.objectDimensions && (
                    <Dimensions />
                )}
            </React.Fragment>
        );
    }
};

export class ShapeTool extends ElementTool {
    id = ELEMENTS.SHAPE;
    icon = "square";
    name = "Shape";
    primary = true;
    shortcut = "s";
    elementType = ELEMENTS.SHAPE;
    elementPicks = {
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
    };
};

export class ArrowTool extends ElementTool {
    id = ELEMENTS.ARROW;
    icon = "arrow-up-right";
    name = "Arrow";
    primary = true;
    shortcut = "a";
    elementType = ELEMENTS.ARROW;
    elementPicks = {
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
    };

    onPickChange(defaults: ElementDefaults, field: string) {
        if (field === FIELDS.END_ARROWHEAD) {
            defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
        }
    }
};

export class TextTool extends ElementTool {
    id = ELEMENTS.TEXT;
    icon = "text";
    name = "Text";
    primary = true;
    shortcut = "t";
    elementType = ELEMENTS.TEXT;
    elementPicks = {
        [FIELDS.TEXT_COLOR]: {
            type: FORM_OPTIONS.COLOR_SELECT,
            className: "flex flex-nowrap w-48 gap-1",
            values: TEXT_COLOR_PICK,
        },
    };

    onEnter(params: ToolLifecycleParams) {
        super.onEnter(params);
        // check if we have an active element and it is begin edited
        params.editor.getElements().forEach((element: any) => {
            if (element.type === ELEMENTS.TEXT && element?.editing) {
                if (!element.text) {
                    removeTextElement(params.editor, element);
                }
                element.editing = false;
            }
        });
    }

    onPointerUp(params: ToolEventParams) {
        super.onPointerUp(params);

        // special handling for text elements: enter edit mode
        if (this.activeElement && this.activeElement.type === ELEMENTS.TEXT) {
            this.activeElement.editing = true;
        }
    }
};

export class DrawTool extends ElementTool {
    id = ELEMENTS.DRAW;
    icon = "pen";
    name = "Draw";
    primary = true;
    shortcut = "d";
    elementType = ELEMENTS.DRAW;
    elementPicks = {
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
    };

    onPointerUp(params: ToolEventParams) {
        super.onPointerUp(params);

        // switch back to drawing tool to allow users continue drawing
        params.tools.setActiveTool(ELEMENTS.DRAW);

        // prevent selecting the element
        if (this.activeElement) {
            this.activeElement.selected = false;
        }
    }
};

export class ImageTool extends ElementTool {
    id = ELEMENTS.IMAGE;
    icon = "image";
    name = "Image";
    shortcut = "i";
    elementType = ELEMENTS.IMAGE;
    elementPicks = null;

    onEnter(params: ToolLifecycleParams) {
        super.onEnter(params);
        params.editor.getElements().forEach((element: any) => {
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
            .then((data: string) => params.editor.addImageElement(data))
            .then(() => {
                params.editor.dispatchChange();
                params.editor.update();
                params.tools.setDefaultToolActive();
            })
            .catch((error: Error) => {
                console.error(error);
                params.tools.setDefaultToolActive();
            });
    }
};

export class StickerTool extends ElementTool {
    id = ELEMENTS.STICKER;
    icon = "sticker";
    name = "Sticker";
    shortcut = "k";
    elementType = ELEMENTS.STICKER;
    elementPicks = {
        [FIELDS.STICKER]: {
            type: FORM_OPTIONS.IMAGE_SELECT,
            className: "w-72 grid grid-cols-8 gap-1",
            values: Object.values(STICKERS).map(stickerName => ({
                value: stickerName,
                image: getStickerImage(stickerName),
            })),
        },
    };
};

export class NoteTool extends ElementTool {
    id = ELEMENTS.NOTE;
    name = "Note";
    icon = "note";
    shortcut = "n";
    elementType = ELEMENTS.NOTE;
    elementPicks = null;
};
