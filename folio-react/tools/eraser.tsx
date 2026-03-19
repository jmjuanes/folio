import React from "react";
import { TOOLS, ELEMENTS } from "../constants.js";
import { getElementNormalizedPosition } from "../lib/elements.js";
import type { Tool } from "../types.ts";

export const EraserTool = {
    id: TOOLS.ERASER,
    state: {},
    onEnter: (editor: any, self: Tool) => {
        editor.getElements().forEach((element: any) => {
            element.erased = false;
        });
    }, 
    onPointerMove: (editor: any, self: Tool, event: any) => {
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
    onPointerUp: (editor: any, self: Tool, event: any) => {
        const erasedElements = editor.getElements().filter((element: any) => {
            return element.erased;
        });
        if (erasedElements.length > 0) {
            editor.removeElements(erasedElements);
            editor.dispatchChange();
        }
    },
} as Tool;
