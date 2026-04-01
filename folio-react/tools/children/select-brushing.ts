import { ToolState } from "../../lib/tool.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export type SelectionArea = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export class SelectBrushingState extends ToolState {
    id: string = "brushing";
    selection: SelectionArea | null = null;

    onEnter(event: EditorPointEvent) {
        // 1. check if there is an active group and we have to reset it
        if (this.editor.page.activeGroup) {
            this.editor.page.activeGroup = null;
            this.editor.update();
        }
        // 2. initialize selection area
        this.selection = {
            x1: event.originalX,
            y1: event.originalY,
            x2: event.originalX,
            y2: event.originalY,
        };
    }

    onPointerMove(event: EditorPointEvent) {
        if (this.selection && typeof event.currentX !== "undefined" && typeof event.currentY !== "undefined") {
            this.selection.x2 = event.currentX;
            this.selection.y2 = event.currentY;
            this.editor.update();
        }
    }

    onPointerUp() {
        if (this.selection) {
            this.editor.setSelectionArea({
                x1: Math.min(this.selection.x1, this.selection.x2),
                x2: Math.max(this.selection.x1, this.selection.x2),
                y1: Math.min(this.selection.y1, this.selection.y2),
                y2: Math.max(this.selection.y1, this.selection.y2),
            });
            this.editor.update();
        }
        this.selection = null;
        this.parent?.transition("idle");
    }
};
