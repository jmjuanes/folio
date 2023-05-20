import {CURSORS} from "folio-core";
import {ACTIONS, STATES} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useCursor = () => {
    const board = useBoard();

    // Move action --> grab or grabbing cursor
    if (board.activeAction === ACTIONS.MOVE) {
        return board.currentState === STATES.DRAGGING ? CURSORS.GRABBING : CURSORS.GRAB;
    }
    // Check for active tool or erase action --> cross cursor
    else if (board.activeTool || board.activeAction === ACTIONS.ERASE) {
        return CURSORS.CROSS;
    }

    // No cursor to display
    return CURSORS.NONE;
};
