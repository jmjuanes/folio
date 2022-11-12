import React from "react";
import {POINT_SOURCES} from "../../constants.js";
import {Handlers} from "../Handlers/index.jsx";
import {Selection} from "../Selection/index.jsx";
import {Elements} from "../Elements/index.jsx";
import {Brush} from "../Brush/index.jsx";

export const Renderer = React.forwardRef((props, ref) => {
    const handlePointerDown = event => {
        event.preventDefault();
        event.stopPropagation();
        const source = event.nativeEvent?.target?.dataset?.type || null;
        const eventInfo = {
            originalX: (event.nativeEvent.offsetX - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.offsetY - props.translateY) / props.zoom,
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
                currentX: (event.offsetX - props.translateX) / props.zoom,
                currentY: (event.offsetY - props.translateY) / props.zoom,
                dx: (event.offsetX - eventInfo.nativeEvent.offsetX) / props.zoom,
                dy: (event.offsetY - eventInfo.nativeEvent.offsetY) / props.zoom,
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

    // Generate transform attribute
    const transform = [
        `translate(${props.translateX} ${props.translateY})`,
        `scale(${props.zoom} ${props.zoom})`,
    ];

    return (
        <svg width="100%" height="100%" style={props.style} onPointerDown={handlePointerDown} ref={ref}>
            <g transform={transform.join(" ")}>
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
            </g>
        </svg>
    );
});

Renderer.defaultProps = {
    width: "100%",
    height: "100%",
    tools: {},
    elements: [],
    brush: null,
    translateX: 0,
    translateY: 0,
    zoom: 1,
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
