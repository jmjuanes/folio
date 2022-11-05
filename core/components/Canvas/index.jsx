import React from "react";

import {Handlers} from "../Handlers/index.jsx";
import {Selection} from "../Selection/index.jsx";

export const Canvas = props => {
    const handlePointerDown = event => {
        event.preventDefault();
        event.stopPropagation();
        const source = event.nativeEvent?.dataset?.type || null;
        const eventInfo = {
            originalX: event.nativeEvent.offsetX,
            originalY: event.nativeEvent.offsetY,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        };

        // Handler pointer listener
        if (source === "handlers") {
            props.onPointHandler?.({
                ...eventInfo,
                direction: event.nativeEvent.target.dataset.value,
            });
        }
        // Element pointer listener
        else if (source === "element") {
            props.onPointElement?.({
                ...eventInfo,
                element: event.nativeEvent.target.dataset.value,
            });
        }
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
        <svg width={props.width} height={props.height} onPointerDown={handlePointerDown}>
            <Selection
                tools={props.tools}
                elements={props.elements}
                selectedElements={props.selectedElements}
            >
                {Object.keys(props.elements).map(id => {
                    const element = props.elements[id];
                    const {Component} = props.tools[element.type];
    
                    return React.createElement(Component, {
                        key: id,
                        ...element,
                    });
                })}
            </Selection>
            {props.selectedElements.length === 1 && (
                <Handlers
                    tools={props.tools}
                    elements={props.elements}
                    selectedElements={props.selectedElements}
                />
            )}
            {props.brush && (
                <rect
                    x={Math.min(props.brush.x, props.brush.x + props.brush.width)}
                    y={Math.min(props.brush.y, props.brush.y + props.brush.height)}
                    width={Math.abs(props.brush.width)}
                    height={Math.abs(props.brush.height)}
                    fill={props.brushFillColor}
                    fillOpacity="0.1"
                    stroke={props.brushStrokeColor}
                    strokeWidth="2px"
                    strokeDasharray="5,5"
                />
            )}
        </svg>
    );
};

Canvas.defaultProps = {
    width: "100%",
    height: "100%",
    tools: {},
    elements: {},
    selectedElements: [],
    brush: null,
    brushFillColor: "#4184f4",
    brushStrokeColor: "#4285f4",
    onPointCanvas: null,
    onPointHandler: null,
    onPointElement: null,
    onPointerDown: null,
    onPointerMove: null,
    onPointerUp: null,
};
