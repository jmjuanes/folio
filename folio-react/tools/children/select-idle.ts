import { ToolState } from "../../lib/tool.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectIdleState extends ToolState {
    onPointerDown(event: EditorPointEvent) {
        this.parent?.transition("pointing", event);
    }
};
