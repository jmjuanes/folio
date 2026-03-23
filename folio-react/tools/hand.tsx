import { TOOLS } from "../constants.js";
import { ToolNode } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class HandTool extends ToolNode {
    id = TOOLS.DRAG;

    // private variables to track the last translation coordinate
    private lastTranslateX = 0;
    private lastTranslateY = 0;

    onPointerDown(event: EditorPointEvent) {
        this.lastTranslateX = this.editor.page.translateX;
        this.lastTranslateY = this.editor.page.translateY;
    }

    onPointerMove(event: EditorPointEvent) {
        this.editor.page.translateX = Math.floor(this.lastTranslateX + (event.dx || 0) * this.editor.page.zoom);
        this.editor.page.translateY = Math.floor(this.lastTranslateY + (event.dy || 0) * this.editor.page.zoom);
    }

    onPointerUp(event: EditorPointEvent) {
        this.lastTranslateX = this.editor.page.translateX;
        this.lastTranslateY = this.editor.page.translateY;
    }
};
