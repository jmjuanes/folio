import {ACTIONS} from "@lib/constants.js";
import {getElementConfig} from "@elements/index.jsx";
import {useBoard} from "@components/contexts/board.jsx";

export const useHandlers = () => {
    const board = useBoard();
    const action = board.activeAction;
    if (!board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = board.elements.filter(el => el.selected);
        // Handlers are only visible when the number of selected elements is exactly 1,
        // and also only if this element is not locked
        if (selectedElements.length === 1 && !selectedElements[0].locked) {
            const config = getElementConfig(selectedElements[0]);
            if (typeof config.getHandlers === "function") {
                return config.getHandlers(selectedElements[0]);
            }
        }
    }
    // No handlers to display
    return [];
};
