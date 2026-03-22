import { TOOLS, ELEMENTS } from "../constants.js";
import { getElementNormalizedPosition } from "../lib/elements.js";
import { BaseTool } from "./base.tsx";
import type { ToolEventParams, ToolLifecycleParams } from "./base.tsx";

export class EraserTool extends BaseTool {
    id = TOOLS.ERASER;
    name = "Erase";
    icon = "erase";
    shortcut = "e";

    onEnter({ editor }: ToolLifecycleParams) {
        editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
    }

    onPointerMove({ editor, event }: ToolEventParams) {
        const x = event.originalX + (event.dx || 0);
        const y = event.originalY + (event.dy || 0);
        editor.getElements().forEach((element: any) => {
            if (!element.erased) {
                const b = element.type === ELEMENTS.ARROW ? getElementNormalizedPosition(element) : element;
                if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                    element.erased = true;
                }
            }
        });
    }

    onPointerUp({ editor }: ToolEventParams) {
        const erasedElements = editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            editor.removeElements(erasedElements);
            editor.dispatchChange();
        }
    }
};
