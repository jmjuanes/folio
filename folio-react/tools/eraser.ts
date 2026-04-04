import {
    TOOLS,
    ELEMENTS,
    ERASER_COLOR,
    ERASER_OPACITY,
    ERASER_SIZE,
    ERASER_FADE_DELAY,
} from "../constants.js";
import { getElementNormalizedPosition } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

const getPointerPosition = (event: EditorPointEvent): [number, number] => {
    return [
        event.originalX + (event.dx || 0),
        event.originalY + (event.dy || 0),
    ];
};

export class EraserTool extends ToolState {
    id = TOOLS.ERASER;
    private pointerId: string | null = null;

    onEnter() {
        // when entering in the eraser tool, reset the erased key in all elements
        // of the current page
        this.editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
        this.pointerId = null;
    }

    onPointerDown(event: EditorPointEvent) {
        const [x, y] = getPointerPosition(event);
        this.pointerId = this.editor.pointer.start({
            color: ERASER_COLOR,
            size: ERASER_SIZE,
            opacity: ERASER_OPACITY,
            fadeDelay: ERASER_FADE_DELAY,
        });
        this.editor.pointer.addPoint(this.pointerId, x, y);
    }

    onPointerMove(event: EditorPointEvent) {
        const [x, y] = getPointerPosition(event);
        this.editor.pointer.addPoint(this.pointerId, x, y);
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
        // get the elements that has to be removed from the board
        const erasedElements = this.editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            this.editor.removeElements(erasedElements);
            this.editor.dispatchChange();
        }
    }
};
