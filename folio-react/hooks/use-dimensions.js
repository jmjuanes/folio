import {ELEMENTS, FIELDS, TOOLS} from "../constants.js";
import {useEditor} from "../contexts/editor.jsx";
import {getRectangleBounds} from "../utils/math.js";

const generateDimensionLabel = el => ({
    value: [
        Math.floor(Math.abs(el.x2 - el.x1)),
        Math.floor(Math.abs(el.y2 - el.y1)),
    ].join(" x "),
    x: Math.max(el.x1, el.x2),
    y: Math.max(el.y1, el.y2),
    // translateX: "-100%",
    // translateY: "0.5rem",
});

// @description returns the dimensions of the selected elements
// @returns {object} dimensions
// @returns {string} dimensions.value label to be displayed in the dimension badge
// @returns {number} dimensions.x x position of the dimension badge
// @returns {number} dimensions.y y position of the dimension badge
export const useDimensions = () => {
    const editor = useEditor();
    const dimensions = [];
    if (editor?.appState?.objectDimensions) {
        // Case 1. No tool or action or we are translating or resizing the element
        // if ((!tool && !action) || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE) {
        if (editor.state.tool === TOOLS.SELECT) {
            const selectedElements = editor.getSelection();
            // Case 1.1. Just one single element to calculate the size
            // In this case, we only want to display the dimension for shapes, drawings, text or images
            if (selectedElements.length === 1) {
                const el = selectedElements[0];
                if (el.type === ELEMENTS.SHAPE || el.type === ELEMENTS.DRAW || el.type === ELEMENTS.TEXT || el.type === ELEMENTS.IMAGE) {
                    dimensions.push(generateDimensionLabel(el));
                }
            }
            // Case 1.2. We have more than one element selected
            // In this case, calculate the dimension of the selection
            else if (selectedElements.length > 1) {
                dimensions.push(generateDimensionLabel(getRectangleBounds(selectedElements)));
            }
        }
        // Case 2. We are creating an element
        // In this case, only for shapes or text will be displayed
        // else if (action === ACTIONS.CREATE && (tool === ELEMENTS.SHAPE || tool === ELEMENTS.TEXT)) {
        else if (editor.state.tool === ELEMENTS.SHAPE || editor.state.tool === ELEMENTS.TEXT) {
            const el = editor.getElements().find(element => element[FIELDS.CREATING]);
            if (el) {
                dimensions.push(generateDimensionLabel(el));
            }
        }
    }
    return dimensions;
};
