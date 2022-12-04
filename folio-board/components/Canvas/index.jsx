import React from "react";
import {EVENTS} from "../../constants.js";
import {Handlers} from "./Handlers.jsx";
import {Bounds} from "./Bounds.jsx";
import {Brush} from "./Brush.jsx";
import {Grid} from "./Grid.jsx";
import {getElementConfig} from "../../elements/index.jsx";

const useSelectedElements = props => {
    if (props.showHandlers || props.showBounds) {
        return (props.elements || []).filter(el => !!el.selected);
    }
    return [];
};

const hasHandlersEnabled = element => {
    return el.edgeHandlers || el.cornerHandlers || el.nodeHandlers;
};

export const Canvas = props => {
    const selectedElements = useSelectedElements(props);

    const handlePointerDown = (event, source, pointListener) => {
        event.preventDefault();
        event.stopPropagation();
        // const source = event.nativeEvent?.target?.dataset?.type || null;
        const eventInfo = {
            originalX: (event.nativeEvent.clientX - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - props.translateY) / props.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        };

        if (source && event.nativeEvent.target?.dataset?.[source]) {
            eventInfo[source] = event.nativeEvent.target.dataset[source];
        }

        // Call the listener provided as an argument
        if (typeof pointListener === "function") {
            pointListener(eventInfo);
        }

        // Emit pointer down event
        props.onPointerDown?.({...eventInfo});

        // Handle pointer move
        const handlePointerMove = event => {
            event.preventDefault();
            props.onPointerMove?.(Object.assign(eventInfo, {
                nativeEvent: event,
                currentX: (event.clientX - props.translateX) / props.zoom,
                currentY: (event.clientY - props.translateY) / props.zoom,
                dx: (event.clientX - eventInfo.nativeEvent.clientX) / props.zoom,
                dy: (event.clientY - eventInfo.nativeEvent.clientY) / props.zoom,
            }));
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
    const handleDoubleClick = (event, source, listener) => {
        event.preventDefault();
        event.stopPropagation();
        const eventInfo = {
            originalX: (event.nativeEvent.clientX - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - props.translateY) / props.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        };

        // Get source item
        if (source && event.nativeEvent.target?.dataset?.[source]) {
            eventInfo[source] = event.nativeEvent.target.dataset[source];
        }

        // Call the provider listener and the global listener
        listener?.(eventInfo);
        props?.onDoubleClick?.(eventInfo);
    };

    // Register keydown events
    React.useEffect(() => {
        const handleKeyDown = event => props?.onKeyDown?.(event);
        const handleKeyUp = event => props?.onKeyUp?.(event);
        // Add events listeners
        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown);
        document.addEventListener(EVENTS.KEY_UP, handleKeyUp);
        return () => {
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown);
            document.removeEventListener(EVENTS.KEY_UP, handleKeyUp);
        };
    }, [props.onKeyDown, props.onKeyUp]);

    // Generate transform attribute
    const transform = [
        `translate(${props.translateX} ${props.translateY})`,
        `scale(${props.zoom} ${props.zoom})`,
    ];

    return (
        <svg
            data-id={props.id}
            data-width={props.width}
            data-height={props.height}
            width="100%"
            height="100%"
            style={{
                backgroundColor: "#eaeaea",
                touchAction: "none",
                userSelect: "none",
                ...props.style,
            }}
            onPointerDown={e => handlePointerDown(e, null, props.onPointCanvas)}
            onDoubleClick={e => handleDoubleClick(e, null, props.onDoubleClickCanvas)}
        >
            <g transform={transform.join(" ")}>
                {props.showBackground && (
                    <rect
                        x="0"
                        y="0"
                        width={props.width}
                        height={props.height}
                        fill={props.background}
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
                {false && props.showBounds && selectedElements.length > 1 && (
                    <Bounds
                        elements={selectedElements}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, null, null)}
                    />
                )}
                <React.Fragment>
                    {props.elements.map(element => {
                        const {Component} = getElementConfig(element);
                        return (
                            <g key={element.id} data-element-id={element.id}>
                                <Component
                                    {...element}
                                    onChange={(k, v) => props?.onElementChange(element.id, k, v)}
                                    onPointerDown={e => handlePointerDown(e, "element", props.onPointElement)}
                                    onDoubleClick={e => handleDoubleClick(e, "element", props.onDoubleClickElement)}
                                />
                            </g>
                        );
                    })}
                </React.Fragment>
                {props.showBrush && !!props.brush && (
                    <Brush
                        x1={props.brush?.x1}
                        x2={props.brush?.x2}
                        y1={props.brush?.y1}
                        y2={props.brush?.y2}
                        fillColor={props.brushFillColor}
                        strokeColor={props.brushStrokeColor}
                    />
                )}
                {false && props.showHandlers && hasHandlersEnabled(selectedElements?.[0]) && (
                    <Handlers
                        elements={selectedElements}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, "handler", props.onPointHandler)}
                    />
                )}
            </g>
        </svg>
    );
};

Canvas.defaultProps = {
    id: "",
    width: 0,
    height: 0,
    background: "#fff",
    elements: [],
    translateX: 0,
    translateY: 0,
    zoom: 1,
    brush: null,
    brushFillColor: "#4184f4",
    brushStrokeColor: "#4285f4",
    onPointCanvas: null,
    onDoubleClickCanvas: null,
    onPointElement: null,
    onDoubleClickElement: null,
    onElementChange: null,
    onPointHandler: null,
    onPointerDown: null,
    onPointerMove: null,
    onPointerUp: null,
    onDoubleClick: null,
    onKeyDown: null,
    onKeyUp: null,
    showHandlers: false,
    showBounds: false,
    showBrush: false,
    showGrid: true,
    showBackground: true,
    style: {},
};
