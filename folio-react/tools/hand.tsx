import { TOOLS } from "../constants.js";
import { TOOL_TYPE } from "../contexts/tools.tsx";
import type { Tool } from "../contexts/tools.tsx";

let lastTranslateX = 0;
let lastTranslateY = 0;

export const HandTool: Tool = {
    id: TOOLS.DRAG,
    type: TOOL_TYPE.CORE,
    name: "Drag",
    icon: "hand-grab",
    primary: true,
    enabledOnReadOnly: true,
    keyboardShortcut: "h",
    onPointerDown: (editor, self, event) => {
        lastTranslateX = editor.page.translateX;
        lastTranslateY = editor.page.translateY;
    },
    onPointerMove: (editor, self, event) => {
        editor.page.translateX = Math.floor(lastTranslateX + event.dx * editor.page.zoom);
        editor.page.translateY = Math.floor(lastTranslateY + event.dy * editor.page.zoom);
    },
    onPointerUp: (editor, self, event) => {
        lastTranslateX = editor.page.translateX;
        lastTranslateY = editor.page.translateY;
    },
};
