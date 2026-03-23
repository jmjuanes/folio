import { ToolNode } from "../../lib/tool.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectIdleTool extends ToolNode {
    onPointerDown(event: EditorPointEvent) {
        this.parent?.transition("pointing", event);
    }
};
