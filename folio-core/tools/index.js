import {RectangleTool} from "./RectangleTool.jsx";

import {TOOLS} from "../constants.js";

export const defaultTools = {
    [TOOLS.RECTANGLE]: RectangleTool,
};

// Return the tool configuration from the specified ID
// TODO: check if the tool is registered and return a fallback tool otherwhise
export const getTool = tool => {
    return defaultTools[tool];
};
