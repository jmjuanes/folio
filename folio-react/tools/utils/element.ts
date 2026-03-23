import { CHANGES } from "../../constants.js";

// @description remove the provided text element from editor and history
// @param {editor} editor - the current editor instance
// @param {element} element - the text element to remove 
export const removeTextElement = (editor: any, element: any) => {
    const history = editor.getHistory();
    if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
        history.shift();
    }
    editor.removeElements([element]);
    editor.dispatchChange();
};
