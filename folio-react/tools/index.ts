import { SelectTool } from "./select.ts";
import { HandTool } from "./hand.ts";
import { EraserTool } from "./eraser.ts";
import { LaserTool } from "./laser.ts";
import { ElementTool } from "./element.ts";
import { GenerateElementsTool } from "./generate-elements.ts";

export const defaultTools = [
    SelectTool,
    HandTool,
    LaserTool,
    EraserTool,
    ElementTool,
    GenerateElementsTool,
];
