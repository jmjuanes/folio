import {ACTIONS} from "@lib/constants.js";
import {getElementConfig} from "@elements/index.jsx";

export const isCornerHandler = handler => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = handler => {
    return handler.startsWith("edge");
};

export const isNodeHandler = handler => {
    return handler.startsWith("node");
};

export const getHandlers = (selectedElements, tool, action) => {
    if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        // const selectedElements = elements.filter(el => el.selected);
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
