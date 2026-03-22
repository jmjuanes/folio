import { TOOLS } from "../constants.js";
import { BaseTool } from "./base.tsx";
import type { ToolEventParams } from "./base.tsx";

export class HandTool extends BaseTool {
    id = TOOLS.DRAG;
    name = "Drag";
    icon = "hand-grab";
    primary = true;
    enabledOnReadOnly = true;
    shortcut = "h";

    private lastTranslateX = 0;
    private lastTranslateY = 0;

    onPointerDown({ editor }: ToolEventParams) {
        this.lastTranslateX = editor.page.translateX;
        this.lastTranslateY = editor.page.translateY;
    }

    onPointerMove({ editor, event }: ToolEventParams) {
        editor.page.translateX = Math.floor(this.lastTranslateX + (event.dx || 0) * editor.page.zoom);
        editor.page.translateY = Math.floor(this.lastTranslateY + (event.dy || 0) * editor.page.zoom);
    }

    onPointerUp({ editor }: ToolEventParams) {
        this.lastTranslateX = editor.page.translateX;
        this.lastTranslateY = editor.page.translateY;
    }
}
