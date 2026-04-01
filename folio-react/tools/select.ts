import { TOOLS } from "../constants.js";
import { ToolState } from "../lib/tool.ts";

import { SelectDraggingState } from "./children/select-dragging.ts";
import { SelectBrushingState } from "./children/select-brushing.ts";
import { SelectIdleState } from "./children/select-idle.ts";
import { SelectPointingState } from "./children/select-pointing.ts";
import { SelectResizingState } from "./children/select-resizing.ts";
import { SelectRotatingState } from "./children/select-rotating.ts";

export class SelectTool extends ToolState {
    id = TOOLS.SELECT;

    children = {
        "idle": SelectIdleState,
        "pointing": SelectPointingState,
        "dragging": SelectDraggingState,
        "resizing": SelectResizingState,
        "rotating": SelectRotatingState,
        "brushing": SelectBrushingState,
    };

    onEnter(params: any) {
        this.transition("idle", params);
    }
};
