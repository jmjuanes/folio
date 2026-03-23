import { ELEMENTS, CHANGES, TOOLS, KEYS, STATUS } from "../constants.js";
import { BaseTool } from "./base.tsx";
import type { CanvasEvent } from "../components/canvas.tsx";

export abstract class ElementTool extends BaseTool {
    abstract id: string;
    elementType = "";
    elementPicks: any = null;
    onPickChange: any = null;

    onPointerDown(event: CanvasEvent) {
        const element = this.editor.createElement(this.elementType);
        const config = this.editor.getElementConfig(element);
        
        element.x1 = event.originalX;
        element.y1 = event.originalY;
        element.x2 = event.originalX;
        element.y2 = event.originalY;
        element.creating = true;

        if (typeof config.onCreateStart === "function") {
            config.onCreateStart(element, event);
        }

        this.editor.clearSelection();
        this.editor.addElements([element]);
        this.editor.setSelection([element.id]);
        this.editor.activeElement = element;
    }

    onPointerMove(event: CanvasEvent) {
        if (this.editor.activeElement?.creating) {
            const element = this.editor.activeElement;
            const config = this.editor.getElementConfig(element);

            element.x2 = event.currentX;
            element.y2 = event.currentY;

            if (typeof config.onCreateMove === "function") {
                config.onCreateMove(element, event, (pos: number) => pos);
            }
        }
    }

    onPointerUp(event: CanvasEvent) {
        if (this.editor.activeElement?.creating) {
            const element = this.editor.activeElement;
            const config = this.editor.getElementConfig(element);

            element.creating = false;
            if (typeof config.onCreateEnd === "function") {
                config.onCreateEnd(element, event);
            }

            this.editor.addHistory({
                type: CHANGES.CREATE,
                elements: [element],
            });

            this.editor.activeElement = null;
            this.editor.dispatchChange();

            if (!this.editor.toolLocked) {
                this.editor.setCurrentTool(TOOLS.SELECT);
            }
        }
    }
}

export class ShapeTool extends ElementTool {
    static id = ELEMENTS.SHAPE;
    id = ELEMENTS.SHAPE;
    icon = "square";
    name = "Shape";
    primary = true;
    shortcut = "s";
    elementType = ELEMENTS.SHAPE;
    elementPicks = {
        shape: { icon: "square" },
        fillColor: { icon: "palette" },
        strokeColor: { icon: "brush" },
    };
}

export class ArrowTool extends ElementTool {
    static id = ELEMENTS.ARROW;
    id = ELEMENTS.ARROW;
    icon = "arrow-up-right";
    name = "Arrow";
    primary = true;
    shortcut = "a";
    elementType = ELEMENTS.ARROW;
}

export class TextTool extends ElementTool {
    static id = ELEMENTS.TEXT;
    id = ELEMENTS.TEXT;
    icon = "type";
    name = "Text";
    primary = true;
    shortcut = "t";
    elementType = ELEMENTS.TEXT;
}

export class DrawTool extends ElementTool {
    static id = ELEMENTS.DRAW;
    id = ELEMENTS.DRAW;
    icon = "draw";
    name = "Draw";
    primary = true;
    shortcut = "d";
    elementType = ELEMENTS.DRAW;
}

export class ImageTool extends ElementTool {
    static id = ELEMENTS.IMAGE;
    id = ELEMENTS.IMAGE;
    icon = "image";
    name = "Image";
    elementType = ELEMENTS.IMAGE;
}

export class StickerTool extends ElementTool {
    static id = ELEMENTS.STICKER;
    id = ELEMENTS.STICKER;
    icon = "smile";
    name = "Sticker";
    elementType = ELEMENTS.STICKER;
}

export class NoteTool extends ElementTool {
    static id = ELEMENTS.NOTE;
    id = ELEMENTS.NOTE;
    icon = "sticky-note";
    name = "Note";
    primary = true;
    shortcut = "n";
    elementType = ELEMENTS.NOTE;
}
