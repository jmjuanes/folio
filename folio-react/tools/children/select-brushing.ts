import { ToolState } from "../../lib/tool.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectBrushingState extends ToolState {
    onEnter(event: EditorPointEvent) {
        this.editor.state.selection = {
            x1: event.originalX,
            y1: event.originalY,
            x2: event.originalX,
            y2: event.originalY,
        };
    }

    onPointerMove(event: EditorPointEvent) {
        this.editor.state.selection.x2 = event.currentX;
        this.editor.state.selection.y2 = event.currentY;
    }

    onPointerUp(event: EditorPointEvent) {
        const selection = this.editor.state.selection;
        this.editor.setSelectionArea({
            x1: Math.min(selection.x1, selection.x2),
            x2: Math.max(selection.x1, selection.x2),
            y1: Math.min(selection.y1, selection.y2),
            y2: Math.max(selection.y1, selection.y2),
        });
        this.editor.state.selection = null;
        this.parent?.transition("idle");
    }
};
