import { TOOLS } from "../constants.js";
import { BaseTool } from "./base.tsx";
import { CanvasEvent } from "../components/canvas.tsx";

export class HandTool extends BaseTool {
    id = TOOLS.DRAG;
    name = "Drag";
    icon = "hand-grab";
    primary = true;
    enabledOnReadOnly = true;
    shortcut = "h";

    private lastTranslateX = 0;
    private lastTranslateY = 0;

    onPointerDown(editor: any, event: CanvasEvent) {
        this.lastTranslateX = editor.page.translateX;
        this.lastTranslateY = editor.page.translateY;
    }

    onPointerMove(editor: any, event: CanvasEvent) {
        editor.page.translateX = Math.floor(this.lastTranslateX + (event.dx || 0) * editor.page.zoom);
        editor.page.translateY = Math.floor(this.lastTranslateY + (event.dy || 0) * editor.page.zoom);
    }

    onPointerUp(editor: any, event: CanvasEvent) {
        this.lastTranslateX = editor.page.translateX;
        this.lastTranslateY = editor.page.translateY;
    }
}
