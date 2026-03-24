import { TOOLS, ELEMENTS } from "../constants.js";
import { getElementNormalizedPosition } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class EraserTool extends ToolState {
    id = TOOLS.ERASER;

    onEnter() {
        // when entering in the eraser tool, reset the erased key in all elements
        // of the current page
        this.editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
    }

    onPointerMove(event: EditorPointEvent) {
        const x = event.originalX + (event.dx || 0);
        const y = event.originalY + (event.dy || 0);
        this.editor.getElements().forEach((element: any) => {
            if (!element.erased) {
                const b = element.type === ELEMENTS.ARROW ? getElementNormalizedPosition(element) : element;
                if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                    element.erased = true;
                }
            }
        });
    }

    onPointerUp(event: EditorPointEvent) {
        const erasedElements = this.editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            this.editor.removeElements(erasedElements);
            this.editor.dispatchChange();
        }
    }
};
