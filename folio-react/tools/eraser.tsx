import { TOOLS, ELEMENTS } from "../constants.js";
import { TOOL_TYPE } from "../contexts/tools.tsx";
import { getElementNormalizedPosition } from "../lib/elements.js";
import type { Tool } from "../contexts/tools.tsx";

export const EraserTool: Tool = {
    id: TOOLS.ERASER,
    type: TOOL_TYPE.CORE,
    name: "Erase",
    icon: "erase",
    keyboardShortcut: "e",
    onActivate: (editor, self) => {
        editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
    },
    onPointerMove: (editor, self, event) => {
        const x = event.originalX + event.dx;
        const y = event.originalY + event.dy;
        editor.getElements().forEach((element: any) => {
            if (!element.erased) {
                const b = element.type === ELEMENTS.ARROW ? getElementNormalizedPosition(element) : element;
                if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                    element.erased = true;
                }
            }
        });
    },
    onPointerUp: (editor, self, event) => {
        const erasedElements = editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            editor.removeElements(erasedElements);
            editor.dispatchChange();
        }
    },
};
