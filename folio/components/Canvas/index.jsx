import React from "react";
import {ResizeHandlers} from "./ResizeHandlers.jsx";
import {NodeHandlers} from "./NodeHandlers.jsx";
import {Bounds} from "./Bounds.jsx";
import {Brush} from "./Brush.jsx";
import {Grid} from "./Grid.jsx";
import {
    getElementConfig,
    hasNodeHandlersEnabled,
    hasResizeHandlersEnabled,
} from "../../elements/index.jsx";

const useSelectedElements = props => {
    if (props.showResizeHandlers || props.showNodeHandlers || props.showBounds) {
        return (props.elements || []).filter(el => !!el.selected);
    }
    return [];
};

export const Canvas = React.forwardRef((props, ref) => {
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
            onPointerDown={e => handlePointerDown(e, null, props.onPointCanvas)}
            onDoubleClick={handleDoubleClick}
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
                        // const handleElementDown = e => {
                        //     // TODO: find element
                        // };
                        return (
                            <g key={element.id} data-element={element.id}>
                                <Component {...element} />
                            </g>
                        );
                    })}
                </React.Fragment>
                {false && props.showResizeHandlers && hasResizeHandlersEnabled(selectedElements?.[0]) && (
                    <ResizeHandlers
                        elements={selectedElements}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, "handler", props.onPointResizeHandler)}
                    />
                )}
                {false && props.showNodeHandlers && hasNodeHandlersEnabled(selectedElements?.[0]) && (
                    <NodeHandlers
                        elements={selectedElements}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, "handler", props.onPointNodeHandler)}
                    />
                )}
                {false && props.showBrush && props.brushPoints?.length === 2 && (
                    <Brush
                        points={props.brushPoints}
                        fillColor={props.brushFillColor}
                        strokeColor={props.brushStrokeColor}
                    />
                )}
            </g>
        </svg>
    );
});

Canvas.defaultProps = {
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
    onPointElement: null,
    onPointNodeHandler: null,
    onPointResizeHandler: null,
    onPointerDown: null,
    onPointerMove: null,
    onPointerUp: null,
    onDoubleClick: null,
    showNodeHandlers: false,
    showResizeHandlers: false,
    showBounds: false,
    showBrush: true,
    showGrid: true,
    showBackground: true,
    style: {},
};
