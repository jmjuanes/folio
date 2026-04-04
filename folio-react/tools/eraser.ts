import { TOOLS, ELEMENTS } from "../constants.js";
import { getElementNormalizedPosition } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class EraserTool extends ToolState {
    id = TOOLS.ERASER;
    pointerId: string | null = null;

    onEnter() {
        // when entering in the eraser tool, reset the erased key in all elements
        // of the current page
        this.editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
    }

    onPointerDown(event: EditorPointEvent) {
        this.pointerId = this.editor.pointer.start({
            color: "#cbd5e1", // Light grey for eraser trail
            size: 20,         // Larger size for eraser
            opacity: 0.5,
        });
        this.addPoint(event);
    }

    onPointerMove(event: EditorPointEvent) {
        this.addPoint(event);
        
        const x = event.originalX + (event.dx || 0);
        const y = event.originalY + (event.dy || 0);
        this.editor.getElements().forEach((element: any) => {
            if (!element.erased) {
                const b = element.type === ELEMENTS.ARROW ? getElementNormalizedPosition(element) : element;
                if (b.x1 <= x && x <= b.x2 && b.y1 <= y && b.y2 >= y) {
                    element.erased = true;
                }
            }
        });
    }

    onPointerUp(event: EditorPointEvent) {
        if (this.pointerId) {
            this.editor.pointer.finish(this.pointerId);
            this.pointerId = null;
        }

        const erasedElements = this.editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            this.editor.removeElements(erasedElements);
            this.editor.dispatchChange();
        }
    }

    addPoint(event: EditorPointEvent) {
        if (this.pointerId) {
            const x = event.originalX + (event.dx || 0);
            const y = event.originalY + (event.dy || 0);
            this.editor.pointer.addPoint(this.pointerId, x, y);
        }
    }
};
