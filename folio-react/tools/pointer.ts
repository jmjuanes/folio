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
import { ToolState } from "../lib/tool.ts";

// alias for setInterval
const createInterval = (ms: number, listener: () => void) => setInterval(listener, ms);

// @private method to group points by id
export class PointerTool extends ToolState {
    id = TOOLS.POINTER;
};
