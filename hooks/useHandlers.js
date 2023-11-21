import {ACTIONS} from "../constants.js";
import {getElementConfig} from "../elements/index.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";

export const useHandlers = () => {
    const board = useBoard();
    const action = board.activeAction;
    if (!board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = board.elements.filter(el => el.selected);
        if (selectedElements.length === 1 && !selectedElements[0].locked) {
            const config = getElementConfig(selectedElements[0]);
            return {
                x1: selectedElements[0].x1,
                x2: selectedElements[0].x2,
                y1: selectedElements[0].y1,
                y2: selectedElements[0].y2,
                xCenter: selectedElements[0].xCenter ?? null,
                yCenter: selectedElements[0].yCenter ?? null,
                showEdgeHandlers: config.edgeHandlers,
                showCornerHandlers: config.cornerHandlers,
                showNodeHandlers: config.nodeHandlers,
            };
        }
    }
    // No handlers to display
    return null;
};
