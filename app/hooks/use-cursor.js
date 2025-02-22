import {STATES, CURSORS, TOOLS} from "../constants.js";

export const useCursor = ({tool, currentState}) => {
    // Move action --> grab or grabbing cursor
    // if (action === ACTIONS.MOVE) {
    if (tool === TOOLS.DRAG) {
        return currentState === STATES.DRAGGING ? CURSORS.GRABBING : CURSORS.GRAB;
    }

    // Check for active tool or erase action --> cross cursor
    // else if (tool || action === ACTIONS.ERASE || action === ACTIONS.SCREENSHOT) {
    else if (tool !== TOOLS.SELECT) {
        return CURSORS.CROSS;
    }

    // No cursor to display
    return CURSORS.NONE;
};
