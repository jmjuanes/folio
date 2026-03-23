import { TOOLS } from "../constants.js";
import { BaseTool } from "./base.tsx";
import type { CanvasEvent } from "../components/canvas.tsx";

export class HandTool extends BaseTool {
    static id = TOOLS.DRAG;
    id = TOOLS.DRAG;
    name = "Drag";
    icon = "hand-grab";
    primary = true;
    enabledOnReadOnly = true;
    shortcut = "h";

    private lastTranslateX = 0;
    private lastTranslateY = 0;

    onPointerDown(event: CanvasEvent) {
        this.lastTranslateX = this.editor.page.translateX;
        this.lastTranslateY = this.editor.page.translateY;
    }

    onPointerMove(event: CanvasEvent) {
        this.editor.page.translateX = Math.floor(this.lastTranslateX + (event.dx || 0) * this.editor.page.zoom);
        this.editor.page.translateY = Math.floor(this.lastTranslateY + (event.dy || 0) * this.editor.page.zoom);
    }

    onPointerUp(event: CanvasEvent) {
        this.lastTranslateX = this.editor.page.translateX;
        this.lastTranslateY = this.editor.page.translateY;
    }
}
