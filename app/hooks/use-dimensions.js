import {ACTIONS, ELEMENTS} from "../constants.js";
// import {getElementConfig} from "../elements.js";
import {useScene} from "../contexts/scene.jsx";

export const useDimensions = ({action, tool}) => {
    const scene = useScene();
    const dimensions = [];
    if (!tool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
        const selectedElements = scene.getSelection();
        if (selectedElements.length === 1) {
            const el = selectedElements[0];
            // Case 1: we are in selection and element is a shape
            // if (el.type === ELEMENTS.SHAPE && !action) {
            if (el.type === ELEMENTS.SHAPE || el.type === ELEMENTS.DRAW || el.type === ELEMENTS.TEXT) {
                dimensions.push({
                    value: `w: ${Math.abs(el.x2 - el.x1)} h: ${Math.abs(el.y2 - el.y1)}`,
                    x: (el.x1 + el.x2) / 2,
                    y: Math.min(el.y1, el.y2),
                    translateX: "-50%",
                    translateY: "calc(-100% - 0.6rem)",
                });
            }
            // Case 2: we are translating or resizing the element and it is a shape
            // else if (el.type === ELEMENTS.SHAPE && (action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE)) {
            // if (el.type === ELEMENTS.SHAPE || el.type === ELEMENTS.DRAW || el.type === ELEMENTS.TEXT) {
            //     props.push({
            //         value: `x: ${el.x1} y: ${el.y1}`,
            //         x: el.x1,
            //         y: el.y1,
            //         translateX: "calc(-100% - 0.6rem)",
            //         translateY: "calc(-100% - 0.6rem)",
            //     });
            //     props.push({
            //         value: `x: ${el.x2} y: ${el.y2}`,
            //         x: el.x2,
            //         y: el.y2,
            //         translateX: "0.6rem",
            //         translateY: "0.6rem",
            //     });
            // }
            // Case 3: we are in an arrow
            else if (el.type === ELEMENTS.ARROW) {
                // Start point
                dimensions.push({
                    value: `x: ${el.x1} y: ${el.y1}`,
                    x: el.x1,
                    y: el.y1,
                    translateX: (el.x1 >= el.x2) ? "0.6rem" : "calc(-100% - 0.6rem)",
                    translateY: (el.y1 >= el.y2) ? "0.6rem" : "calc(-100% - 0.6rem)",
                });
                // End point
                dimensions.push({
                    value: `x: ${el.x2} y: ${el.y2}`,
                    x: el.x2,
                    y: el.y2,
                    translateX: (el.x2 >= el.x1) ? "0.6rem" : "calc(-100% - 0.6rem)",
                    translateY: (el.y2 >= el.y1) ? "0.6rem" : "calc(-100% - 0.6rem)",
                });
            }
        }
    }
    return dimensions;
};
