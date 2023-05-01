import React from "react";
import {CURSORS, EVENTS, FONT_SOURCES} from "../constants.js";
import {Handlers} from "./Handlers.jsx";
import {Bounds} from "./Bounds.jsx";
import {Brush} from "./Brush.jsx";
import {Grid} from "./Grid.jsx";
import {Pointer} from "./Pointer.jsx";
import {getElementConfig} from "../elements/index.jsx";
import {AssetsProvider} from "../contexts/AssetsContext.jsx";
import {delay, isTouchOrPenEvent} from "../utils.js";

export const Canvas = props => {
    const canvasRef = React.useRef(null);
    const longPressTimerRef = React.useRef(0);
    const clearLongPressTimer = React.useCallback(() => window.clearTimeout(longPressTimerRef.current), []);
    const [canvasSize, setCanvasSize] = React.useState([100, 100]);

    const handleContextMenu = event => {
        props?.onContextMenu?.({
            x: event.nativeEvent.clientX,
            y: event.nativeEvent.clientY,
        });
        return false;
    };

    const handlePointerDown = (event, source, pointListener) => {
        event.preventDefault();
        event.stopPropagation();

        // Prevent fire pointer down event if pressed button is not left
        if (event.nativeEvent.button) {
            return;
        }
        // Register timer function
        if (isTouchOrPenEvent(event)) {
            longPressTimerRef.current = delay(props.longPressDelay, () => {
                document.removeEventListener("pointermove", handlePointerMove);
                document.removeEventListener("pointerup", handlePointerUp);
                document.removeEventListener("pointerleave", handlePointerUp);
                // Execute context menu handler
                return handleContextMenu(event);
            });
        }
        // const source = event.nativeEvent?.target?.dataset?.type || null;
        const {top, left} = canvasRef.current.getBoundingClientRect();
        const eventInfo = {
            originalX: (event.nativeEvent.clientX - left - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - top - props.translateY) / props.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            originalEvent: event.nativeEvent,
            // prevEvent: null,
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
            clearLongPressTimer();
            event.preventDefault();
            props.onPointerMove?.(Object.assign(eventInfo, {
                currentEvent: event,
                currentX: (event.clientX - left - props.translateX) / props.zoom,
                currentY: (event.clientY - top - props.translateY) / props.zoom,
                dx: (event.clientX - eventInfo.originalEvent.clientX) / props.zoom,
                dy: (event.clientY - eventInfo.originalEvent.clientY) / props.zoom,
                // prevDx: eventInfo.prevEvent ? ((eventInfo.prevEvent.clientX - eventInfo.originalEvent.clientX) / props.zoom) : 0,
                // prevDy: eventInfo.prevEvent ? ((eventInfo.prevEvent.clientY - eventInfo.originalEvent.clientY) / props.zoom) : 0,
            }));
            // eventInfo.prevEvent = event;
        };

        // Handle pointer up
        const handlePointerUp = event => {
            clearLongPressTimer();
            event.preventDefault();
            props.onPointerUp?.(eventInfo);

            // Remove events listeners
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointerleave", handlePointerUp);
        };

        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);

        // Clear focus
        if (document?.activeElement && document?.activeElement !== document.body) {
            document.activeElement.blur();
        }
    };

    // Handle double click
    const handleDoubleClick = (event, source, listener) => {
        event.preventDefault();
        event.stopPropagation();

        // Prevent fire pointer down event if pressed button is not left
        if (event.nativeEvent.button) {
            return;
        }

        const {top, left} = canvasRef.current.getBoundingClientRect();
        const eventInfo = {
            originalX: (event.nativeEvent.clientX - left - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - top - props.translateY) / props.zoom,
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

    // Register additional events
    React.useEffect(() => {
        const handleKeyDown = event => props?.onKeyDown?.(event);
        const handleKeyUp = event => props?.onKeyUp?.(event);
        const handlePaste = event => props?.onPaste?.(event);
        const handleResize = event => {
            if (canvasRef.current) {
                const size = canvasRef.current.getBoundingClientRect();
                setCanvasSize([size.width, size.height]);
            }
            props?.onResize?.(event);
        };
        // Add events listeners
        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown);
        document.addEventListener(EVENTS.KEY_UP, handleKeyUp);
        document.addEventListener(EVENTS.PASTE, handlePaste);
        window.addEventListener(EVENTS.RESIZE, handleResize);

        // We need to call the resize for the first time
        handleResize(null);
        return () => {
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown);
            document.removeEventListener(EVENTS.KEY_UP, handleKeyUp);
            document.removeEventListener(EVENTS.PASTE, handlePaste);
            window.removeEventListener(EVENTS.RESIZE, handleResize);
        };
    }, [props.onKeyDown, props.onKeyUp, props.onPaste]);

    // Generate transform attribute
    const transform = [
        `translate(${props.translateX} ${props.translateY})`,
        `scale(${props.zoom} ${props.zoom})`,
    ];

    return (
        <svg
            ref={canvasRef}
            className={props.svgClassName}
            data-id={props.id}
            data-width={props.width}
            data-height={props.height}
            width="100%"
            height="100%"
            style={{
                backgroundColor: props.backgroundColor,
                touchAction: "none",
                userSelect: "none",
                WebkitTouchCallout: "none",
                cursor: props.cursor,
                ...props.svgStyle,
            }}
            onPointerDown={e => handlePointerDown(e, null, props.onPointCanvas)}
            onDoubleClick={e => handleDoubleClick(e, null, props.onDoubleClickCanvas)}
            onContextMenu={e => handleContextMenu(e)}
        >
            <style type="text/css">
                {props.fonts.map(font => `@import url('${font}');`).join("")}
            </style>
            <g transform={transform.join(" ")}>
                {props.showGrid && (
                    <Grid
                        translateX={props.translateX}
                        translateY={props.translateY}
                        zoom={props.zoom}
                        width={canvasSize[0]}
                        height={canvasSize[1]}
                    />
                )}
                <AssetsProvider value={props.assets || {}}>
                    {props.elements.map(element => {
                        const content = getElementConfig(element).render({
                            ...element,
                            onChange: (k, v) => props?.onElementChange?.(element.id, k, v),
                            onPointerDown: e => handlePointerDown(e, "element", props.onPointElement),
                            onDoubleClick: e => handleDoubleClick(e, "element", props.onDoubleClickElement),
                        });
                        const style = {
                            opacity: element.erased ? "0.3" : "1.0",
                            cursor: props.cursor ? CURSORS.NONE : CURSORS.MOVE,
                        };
                        return (
                            <g key={element.id} data-element={element.id} style={style}>
                                {content}
                            </g>
                        );
                    })}
                </AssetsProvider>
                {props.showBrush && !!props.brush && (
                    <Brush
                        position={props.brush}
                        fillColor={props.brushFillColor}
                        strokeColor={props.brushStrokeColor}
                    />
                )}
                {props.showBounds && props.bounds?.length > 0 && (
                    <React.Fragment>
                        {props.bounds.map((item, index) => (
                            <Bounds
                                key={index}
                                position={item}
                                fillColor={item.fillColor}
                                strokeColor={item.strokeColor}
                                strokeDasharray={item.strokeDasharray}
                                zoom={props.zoom}
                            />
                        ))}
                    </React.Fragment>
                )}
                {props.showHandlers && props.handlers && (
                    <Handlers
                        position={props.handlers}
                        edgeHandlers={props.showEdgeHandlers}
                        cornerHandlers={props.showCornerHandlers}
                        nodeHandlers={props.showNodeHandlers}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, "handler", props.onPointHandler)}
                    />
                )}
                {props.showPointer && props.pointer && (
                    <Pointer
                        position={props.pointer}
                        fillColor={props.pointerFillColor}
                        strokeColor={props.pointerStrokeColor}
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
    backgroundColor: "#fafafa",
    elements: [],
    assets: {},
    fonts: Object.values(FONT_SOURCES),
    cursor: "",
    translateX: 0,
    translateY: 0,
    zoom: 1,
    bounds: [],
    handlers: null,
    brush: null,
    brushFillColor: "#4184f4",
    brushStrokeColor: "#4285f4",
    pointer: null,
    pointerFillColor: "#fff",
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
    onContextMenu: null,
    onKeyDown: null,
    onKeyUp: null,
    onPaste: null,
    onResize: null,
    showBounds: true,
    showHandlers: true,
    showEdgeHandlers: false,
    showCornerHandlers: false,
    showNodeHandlers: false,
    showBrush: false,
    showGrid: true,
    showPointer: false,
    svgStyle: {},
    svgClassName: "",
    longPressDelay: 700,
};
