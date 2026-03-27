import { ELEMENTS, CHANGES, TOOLS } from "../constants.js";
import { getElementConfig } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class ElementTool extends ToolState {
    id = TOOLS.ELEMENT;
    private elementType: string = "";

    onPointerDown(event: EditorPointEvent) {
        const element = this.editor.createElement(this.elementType);
        const config = getElementConfig(element);

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

    onPointerMove(event: EditorPointEvent) {
        if (this.editor.activeElement?.creating) {
            const element = this.editor.activeElement;
            const config = getElementConfig(element);

            element.x2 = event.currentX;
            element.y2 = event.currentY;

            if (typeof config.onCreateMove === "function") {
                config.onCreateMove(element, event, (pos: number) => pos);
            }
        }
    }

    onPointerUp(event: EditorPointEvent) {
        if (this.editor.activeElement?.creating) {
            const element = this.editor.activeElement;
            const config = getElementConfig(element);

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
};

export class ShapeTool extends ElementTool {
    id = ELEMENTS.SHAPE;
    elementType = ELEMENTS.SHAPE;
};

export class ArrowTool extends ElementTool {
    id = ELEMENTS.ARROW;
    elementType = ELEMENTS.ARROW;
};

export class TextTool extends ElementTool {
    id = ELEMENTS.TEXT;
    elementType = ELEMENTS.TEXT;
};

export class DrawTool extends ElementTool {
    id = ELEMENTS.DRAW;
    elementType = ELEMENTS.DRAW;
};

export class ImageTool extends ElementTool {
    id = ELEMENTS.IMAGE;
    elementType = ELEMENTS.IMAGE;
};

export class StickerTool extends ElementTool {
    id = ELEMENTS.STICKER;
    elementType = ELEMENTS.STICKER;
};

export class NoteTool extends ElementTool {
    id = ELEMENTS.NOTE;
    elementType = ELEMENTS.NOTE;
};
