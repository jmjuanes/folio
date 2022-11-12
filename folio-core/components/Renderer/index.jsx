import React from "react";
import {POINT_SOURCES} from "../../constants.js";
import {Handlers} from "../Handlers/index.jsx";
import {Selection} from "../Selection/index.jsx";
import {Elements} from "../Elements/index.jsx";
import {Brush} from "../Brush/index.jsx";

export const Renderer = props => {
    const handlePointerDown = event => {
        event.preventDefault();
        event.stopPropagation();
        const source = event.nativeEvent?.target?.dataset?.type || null;
        const eventInfo = {
            originalX: event.nativeEvent.offsetX,
            originalY: event.nativeEvent.offsetY,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        };

        // Handler pointer listener
        if (source === POINT_SOURCES.HANDLER) {
            props.onPointHandler?.({
                ...eventInfo,
                handler: event.nativeEvent.target.dataset.value,
            });
        }
        // Element pointer listener
        else if (source === POINT_SOURCES.ELEMENT) {
            props.onPointElement?.({
                ...eventInfo,
                element: event.nativeEvent.target.dataset.value,
            });
        }
        // Selection pointer listener
        // else if (source === POINT_SOURCES.SELECTION) {
        //     props.onPointSelection?.({...eventInfo});
        // }
        // Other listener
        else if (source === null) {
            props.onPointCanvas?.(eventInfo);
        }

        // Emit pointer down event
        props.onPointerDown?.({...eventInfo});

        // Handle pointer move
        const handlePointerMove = event => {
            event.preventDefault();
            props.onPointerMove?.({
                ...eventInfo,
                nativeEvent: event,
                currentX: event.offsetX,
                currentY: event.offsetY,
                dx: event.offsetX - eventInfo.originalX,
                dy: event.offsetY - eventInfo.originalY,
            });
        };

        // Handle pointer up
        const handlePointerUp = event => {
            event.preventDefault();
            props.onPointerUp?.({
                ...eventInfo,
                nativeEvent: event,
            });

            // Remove events listeners
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointerleave", handlePointerUp);
        };

        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
    };

    return (
        <svg
            width={props.width}
            height={props.height}
            style={props.style}
            onPointerDown={handlePointerDown}
        >
            {props.showSelection && (
                <Selection
                    tools={props.tools}
                    elements={props.elements}
                />
            )}
            <Elements
                tools={props.tools}
                elements={props.elements}
            />
            {props.showHandlers && (
                <Handlers
                    tools={props.tools}
                    elements={props.elements}
                />
            )}
            {props.showBrush && !!props.brush && (
                <Brush
                    {...props.brush}
                    fillColor={props.brushFillColor}
                    strokeColor={props.brushStrokeColor}
                />
            )}
        </svg>
    );
};

Renderer.defaultProps = {
    width: "100%",
    height: "100%",
    tools: {},
    elements: [],
    brush: null,
    brushFillColor: "#4184f4",
    brushStrokeColor: "#4285f4",
    onPointCanvas: null,
    onPointHandler: null,
    onPointElement: null,
    onPointerDown: null,
    onPointerMove: null,
    onPointerUp: null,
    showHandlers: false,
    showSelection: false,
    showBrush: true,
    style: {
        touchAction: "none",
        userSelect: "none",
    },
};
