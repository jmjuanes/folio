import React from "react";

import {HANDLERS_TYPES} from "../../constants.js";
import {CornerHandlers} from "./CornerHandlers.jsx";
import {EdgeHandlers} from "./EdgeHandlers.jsx";

export const Handlers = props => {
    const element = props.elements[props.selectedElements[0]];
    const handlerType = props.tools[element.type].handlers || HANDLERS_TYPES.NONE;
    const points = props.tools[element.type].getBoundaryPoints(element);

    // Handle element resize
    const handlePointerDown = (event, handler) => {
        event.stopPropagation();
        event.preventDefault();
        const el = {...element}; // Create a snapshot of the current element
        const startX = event.nativeEvent.offsetX;
        const startY = event.nativeEvent.offsetY;
        const hasShiftKey = event.nativeEvent.shiftKey;

        // Register pointer move and up events
        const handlePointerMove = event => {
            return props.onElementChange({
                id: element.id,
                ...handler(el, event.offsetX - startX, event.offsetY - startY, hasShiftKey),
            });
        };

        // Pointer up listener
        const handlePointerUp = () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
    };

    return (
        <React.Fragment>
            {handlerType === HANDLERS_TYPES.RECTANGLE && (
                <React.Fragment>
                    <EdgeHandlers
                        color={props.handlerColor}
                        points={points}
                        onPointerDown={handlePointerDown}
                    />
                    <CornerHandlers
                        color={props.handlerColor}
                        points={points}
                        onPointerDown={handlePointerDown}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

Handlers.defaultProps = {
    tools: {},
    elements: {},
    selectedElements: [],
    onElementChange: null,
    handlerColor: "#4285f4",
    handlerSize: 5,
};
