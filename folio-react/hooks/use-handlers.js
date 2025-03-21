import {TOOLS} from "../constants.js";
import {getElementConfig} from "../elements.js";
import {useEditor} from "../contexts/editor.jsx";

export const useHandlers = () => {
    const editor = useEditor();

    // if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
    if (editor.state.tool === TOOLS.SELECT) {
        // Get current selection in editor
        const selectedElements = editor.getSelection();

        // Handlers are only visible when the number of selected elements is exactly 1,
        // and also only if this element is not locked and is not in editing mode
        if (selectedElements.length === 1 && !selectedElements[0].locked && !selectedElements[0].editing) {
            const config = getElementConfig(selectedElements[0]);
            if (typeof config.getHandlers === "function") {
                return config.getHandlers(selectedElements[0]);
            }
        }
    }

    // No handlers to display
    return [];
};
