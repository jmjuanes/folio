import {CURSORS, TOOLS} from "../constants.js";
import {useEditor} from "../contexts/editor.jsx";

export const useCursor = () => {
    const editor = useEditor();

    // Move action --> grab or grabbing cursor
    if (editor.state.tool === TOOLS.DRAG) {
        // return status === STATUS.DRAGGING ? CURSORS.GRABBING : CURSORS.GRAB;
        return CURSORS.GRAB;
    }

    // Check for active tool or erase action --> cross cursor
    else if (editor.state.tool !== TOOLS.SELECT) {
        return CURSORS.CROSS;
    }

    // No cursor to display
    return CURSORS.NONE;
};
