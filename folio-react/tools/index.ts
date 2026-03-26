import { SelectTool } from "./select.ts";
import { HandTool } from "./hand.ts";
import { EraserTool } from "./eraser.ts";
import { PointerTool } from "./pointer.ts";
import {
    ShapeTool,
    ArrowTool,
    TextTool,
    DrawTool,
    ImageTool,
    StickerTool,
    NoteTool,
} from "./element.ts";

export const defaultTools = [
    SelectTool,
    HandTool,
    PointerTool,
    EraserTool,
    ShapeTool,
    ArrowTool,
    TextTool,
    DrawTool,
    ImageTool,
    StickerTool,
    NoteTool,
];
