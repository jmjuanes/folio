import {TOOLS} from "../constants.js";
import {getElementConfig} from "../elements.js";
import {useScene} from "../contexts/scene.jsx";

export const useHandlers = ({tool}) => {
    const scene = useScene();

    // if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
    if (tool === TOOLS.SELECT) {
        // Get current selection in scene
        const selectedElements = scene.getSelection();

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
