import {getElementConfig} from "folio-core";
import {ACTIONS} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useHandlers = () => {
    const board = useBoard();
    const action = board.activeAction;
    if (!board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = board.elements.filter(el => el.selected);
        if (selectedElements.length === 1) {
            const config = getElementConfig(selectedElements[0]);
            return {
                x1: selectedElements[0].x1,
                x2: selectedElements[0].x2,
                y1: selectedElements[0].y1,
                y2: selectedElements[0].y2,
                showEdgeHandlers: config.edgeHandlers,
                showCornerHandlers: config.cornerHandlers,
                showNodeHandlers: config.nodeHandlers,
            };
        }
    }
    // No handlers to display
    return null;
};
