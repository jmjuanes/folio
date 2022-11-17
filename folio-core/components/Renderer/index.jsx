import React from "react";
import {POINT_SOURCES} from "../../constants.js";
import {Handlers} from "../Handlers/index.jsx";
import {Selection} from "../Selection/index.jsx";
import {Elements} from "../Elements/index.jsx";
import {Brush} from "../Brush/index.jsx";
import {Grid} from "../Grid/index.jsx";

export const Renderer = React.forwardRef((props, ref) => {
    const handlePointerDown = event => {
        event.preventDefault();
        event.stopPropagation();
        const source = event.nativeEvent?.target?.dataset?.type || null;
        const eventInfo = {
            originalX: (event.nativeEvent.clientX - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - props.translateY) / props.zoom,
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
                currentX: (event.clientX - props.translateX) / props.zoom,
                currentY: (event.clientY - props.translateY) / props.zoom,
                dx: (event.clientX - eventInfo.nativeEvent.clientX) / props.zoom,
                dy: (event.clientY - eventInfo.nativeEvent.clientY) / props.zoom,
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

    // Handle double click
    const handleDoubleClick = event => {
        event.preventDefault();
        event.stopPropagation();
        props?.onDoubleClick?.({
            originalX: (event.nativeEvent.clientX - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - props.translateY) / props.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        });
    };

    // Generate transform attribute
    const transform = [
        `translate(${props.translateX} ${props.translateY})`,
        `scale(${props.zoom} ${props.zoom})`,
    ];

    return (
        <svg
            ref={ref}
            width="100%"
            height="100%"
            style={{
                backgroundColor: "#eaeaea",
                touchAction: "none",
                userSelect: "none",
                ...props.style,
            }}
            onPointerDown={handlePointerDown}
            onDoubleClick={handleDoubleClick}
        >
            <g transform={transform.join(" ")}>
                {props.showBackground && (
                    <rect
                        x="0"
                        y="0"
                        width={props.width}
                        height={props.height}
                        fill={props.backgroundFillColor}
                        stroke="none"
                    />
                )}
                {props.showGrid && (
                    <Grid
                        zoom={props.zoom}
                        width={props.width}
                        height={props.height}
                    />
                )}
                {props.showSelection && (
                    <Selection
                        tools={props.tools}
                        elements={props.elements}
                        zoom={props.zoom}
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
                        zoom={props.zoom}
                    />
                )}
                {props.showBrush && (
                    <Brush
                        x={props.brushX}
                        y={props.brushY}
                        width={props.brushWidth}
                        height={props.brushHeight}
                        fillColor={props.brushFillColor}
                        strokeColor={props.brushStrokeColor}
                    />
                )}
            </g>
        </svg>
    );
});

Renderer.defaultProps = {
    width: 0,
    height: 0,
    backgroundFillColor: "#fff",
    tools: {},
    elements: [],
    translateX: 0,
    translateY: 0,
    zoom: 1,
    brushX: 0,
    brushY: 0,
    brushWidth: 0,
    brushHeight: 0,
    brushFillColor: "#4184f4",
    brushStrokeColor: "#4285f4",
    onPointCanvas: null,
    onPointHandler: null,
    onPointElement: null,
    onPointerDown: null,
    onPointerMove: null,
    onPointerUp: null,
    onDoubleClick: null,
    showHandlers: false,
    showSelection: false,
    showBrush: true,
    showGrid: true,
    showBackground: true,
    style: {},
};
