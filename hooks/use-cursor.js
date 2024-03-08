import {ACTIONS, STATES, CURSORS} from "../lib/constants.js";

export const useCursor = ({action, tool, currentState}) => {
    // Move action --> grab or grabbing cursor
    if (action === ACTIONS.MOVE) {
        return currentState === STATES.DRAGGING ? CURSORS.GRABBING : CURSORS.GRAB;
    }

    // Check for active tool or erase action --> cross cursor
    else if (tool || action === ACTIONS.ERASE || action === ACTIONS.SCREENSHOT) {
        return CURSORS.CROSS;
    }

    // No cursor to display
    return CURSORS.NONE;
};
