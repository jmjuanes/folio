import { ELEMENTS, FIELDS, TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.jsx";
import { getElementSize, getElementsBoundingRectangle } from "../lib/elements.js";

export type DimensionLabel = {
    value: string; // label to be displayed in the dimension badge
    x: number;     // x position of the dimension badge
    y: number;     // y position of the dimension badge
};

const generateDimensionLabel = (elements: any[] = []): DimensionLabel => {
    const rectangle = getElementsBoundingRectangle(elements);
    return {
        value: [
            Math.floor(Math.abs(rectangle[1][0] - rectangle[0][0])),
            Math.floor(Math.abs(rectangle[0][1] - rectangle[1][1])),
        ].join(" x "),
        x: Math.max(...rectangle.map(p => p[0])),
        y: Math.max(...rectangle.map(p => p[1])),
    };
};

// @description returns the dimensions of the selected elements
// @returns {object} dimensions
// @returns {string} dimensions.value label to be displayed in the dimension badge
// @returns {number} dimensions.x x position of the dimension badge
// @returns {number} dimensions.y y position of the dimension badge
export const useDimensions = () => {
    const editor = useEditor();
    const dimensions: DimensionLabel[] = [];
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
                    const sizes = getElementSize(el);
                    dimensions.push({
                        value: `${Math.floor(sizes[0])} x ${Math.floor(sizes[1])}`,
                        x: Math.max(el.x1, el.x2),
                        y: Math.max(el.y1, el.y2),
                    });
                }
            }
            // Case 1.2. We have more than one element selected
            // In this case, calculate the dimension of the selection
            else if (selectedElements.length > 1) {
                dimensions.push(generateDimensionLabel(selectedElements));
            }
        }
        // Case 2. We are creating an element
        // In this case, only for shapes or text will be displayed
        // else if (action === ACTIONS.CREATE && (tool === ELEMENTS.SHAPE || tool === ELEMENTS.TEXT)) {
        else if (editor.state.tool === ELEMENTS.SHAPE || editor.state.tool === ELEMENTS.TEXT) {
            const el = editor.getElements().find(element => element[FIELDS.CREATING]);
            if (el) {
                dimensions.push(generateDimensionLabel([ el ]));
            }
        }
    }
    return dimensions;
};
