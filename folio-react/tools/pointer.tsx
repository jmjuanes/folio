import React from "react";
import { uid } from "uid/secure";
import {
    TOOLS,
    EVENTS,
    CURSORS,
    NONE,
    POINTER_COLOR,
    POINTER_DELAY,
    POINTER_INTERVAL_DELAY,
    TRANSPARENT,
    POINTER_TENSION,
    POINTER_SIZE,
} from "../constants.js";
import { hypotenuse } from "../utils/math.ts";
import { SvgContainer } from "../components/svg.tsx";
import { BaseTool } from "./base.tsx";

// alias for setInterval
const createInterval = (ms: number, listener: () => void) => setInterval(listener, ms);

// @private method to group points by id
export class PointerTool extends BaseTool {
    static id = TOOLS.POINTER;
    id = TOOLS.POINTER;
    name = "Laser Pointer";
    icon = "laser-pointer";
    enabledOnReadOnly = true;
    shortcut = "l";
}
