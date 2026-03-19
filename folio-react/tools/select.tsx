import React from "react";
import { TOOLS } from "../constants.js";
import type { Tool } from "../types.ts";

export const SelectTool = {
    id: TOOLS.SELECT,
    state: {
        selection: [],
    },
    
} as Tool;
