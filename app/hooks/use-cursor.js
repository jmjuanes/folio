import {CURSORS, TOOLS} from "../constants.js";
import {useActiveTool} from "../contexts/tools.jsx";

export const useCursor = () => {
    const [tool] = useActiveTool();
    // Move action --> grab or grabbing cursor
    if (tool === TOOLS.DRAG) {
        // return status === STATUS.DRAGGING ? CURSORS.GRABBING : CURSORS.GRAB;
        return CURSORS.GRAB;
    }
    // Check for active tool or erase action --> cross cursor
    else if (tool !== TOOLS.SELECT) {
        return CURSORS.CROSS;
    }
    // No cursor to display
    return CURSORS.NONE;
};
