import {
    TOOLS,
    LASER_COLOR,
    LASER_SIZE,
    LASER_FADE_DELAY,
    LASER_FADE_DURATION,
} from "../constants.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class LaserTool extends ToolState {
    id = TOOLS.LASER;
    sessionId: string | null = null;

    onPointerDown(event: EditorPointEvent) {
        this.sessionId = this.editor.pointer.start({
            color: LASER_COLOR,
            size: LASER_SIZE,
            fadeDelay: LASER_FADE_DELAY,
            fadeDuration: LASER_FADE_DURATION,
        });
        this.editor.pointer.addPoint(this.sessionId!, event.originalX, event.originalY);
    }

    onPointerMove(event: EditorPointEvent) {
        if (this.sessionId) {
            const x = event.originalX + (event.dx || 0);
            const y = event.originalY + (event.dy || 0);
            this.editor.pointer.addPoint(this.sessionId, x, y);
        }
    }

    onPointerUp() {
        if (this.sessionId) {
            this.editor.pointer.finish(this.sessionId);
            this.sessionId = null;
        }
    }
};
