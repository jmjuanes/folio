import { TOOLS } from "../constants.js";
import type { Tool } from "../contexts/tools.tsx";

let lastTranslateX = 0;
let lastTranslateY = 0;

export const HandTool: Tool = {
    id: TOOLS.DRAG,
    name: "Drag",
    icon: "hand-grab",
    primary: true,
    enabledOnReadOnly: true,
    shortcut: "h",

    onPointerDown: (editor, event) => {
        lastTranslateX = editor.page.translateX;
        lastTranslateY = editor.page.translateY;
    },

    onPointerMove: (editor, event) => {
        editor.page.translateX = Math.floor(lastTranslateX + event.dx * editor.page.zoom);
        editor.page.translateY = Math.floor(lastTranslateY + event.dy * editor.page.zoom);
    },

    onPointerUp: (editor, event) => {
        lastTranslateX = editor.page.translateX;
        lastTranslateY = editor.page.translateY;
    },
};
