import React from "react";
import { TOOLS, ELEMENTS } from "../constants.js";

// Import UI components (to be created)
import { SelectCanvasOverlay } from "./ui/SelectUI";
import { PointerCanvasOverlay } from "../components/pointer.js";
import { ElementToolbar, ElementCanvasOverlay } from "./ui/ElementUI";

export interface ToolUI {
    Toolbar?: React.ComponentType<{ tool?: any }>;
    CanvasOverlay?: React.ComponentType<{ tool?: any }>;
}

export const ToolUIRegistry: Record<string, ToolUI> = {
    [TOOLS.SELECT]: {
        CanvasOverlay: SelectCanvasOverlay,
    },
    [TOOLS.POINTER]: {
        CanvasOverlay: PointerCanvasOverlay,
    },
    [ELEMENTS.SHAPE]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.ARROW]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.TEXT]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.DRAW]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.IMAGE]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.STICKER]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
    [ELEMENTS.NOTE]: {
        Toolbar: ElementToolbar,
        CanvasOverlay: ElementCanvasOverlay,
    },
};
