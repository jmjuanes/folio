import React from "react";
import {
    CURSORS,
    EVENTS,
    FONT_SOURCES,
    NONE,
    SNAPS_STROKE_COLOR,
    SNAPS_STROKE_WIDTH,
    BRUSH_FILL_COLOR,
    BRUSH_FILL_OPACITY,
    BRUSH_STROKE_COLOR,
    BRUSH_STROKE_WIDTH,
    BRUSH_STROKE_DASH,
    BOUNDS_STROKE_COLOR,
    BOUNDS_STROKE_WIDTH,
    BOUNDS_STROKE_DASH,
} from "../constants.js";
import {AssetsProvider} from "../contexts/assets.jsx";
import {renderElement} from "./elements/index.jsx";
import {SvgContainer} from "./svg.jsx";
import {Handlers} from "./handlers.jsx";
import {Grid} from "./grid.jsx";
import {ObjectDimensions} from "./object-dimensions.jsx";
import {clearFocus} from "../utils/dom.js";
import {preventDefault, isTouchOrPenEvent} from "../utils/events.js";

const delay = (timeout, cb) => window.setTimeout(cb, timeout);

export const Canvas = props => {
    const canvasRef = React.useRef(null);
    const longPressTimerRef = React.useRef(0);
    const clearLongPressTimer = React.useCallback(() => window.clearTimeout(longPressTimerRef.current), []);
    const [canvasSize, setCanvasSize] = React.useState([100, 100]);

    const handleContextMenu = event => {
        event.preventDefault();
        const {top, left} = canvasRef.current.getBoundingClientRect();
        props?.onContextMenu?.({
            x: event.nativeEvent.clientX - left,
            y: event.nativeEvent.clientY - top,
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
            drag: false,
            originalX: (event.nativeEvent.clientX - left - props.translateX) / props.zoom,
            originalY: (event.nativeEvent.clientY - top - props.translateY) / props.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            originalEvent: event.nativeEvent,
            detail: {},
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
                drag: true,
                currentEvent: event,
                currentX: (event.clientX - left - props.translateX) / props.zoom,
                currentY: (event.clientY - top - props.translateY) / props.zoom,
                dx: (event.clientX - eventInfo.originalEvent.clientX) / props.zoom,
                dy: (event.clientY - eventInfo.originalEvent.clientY) / props.zoom,
                // prevDx: eventInfo.prevEvent ? ((eventInfo.prevEvent.clientX - eventInfo.originalEvent.clientX) / props.zoom) : 0,
                // prevDy: eventInfo.prevEvent ? ((eventInfo.prevEvent.clientY - eventInfo.originalEvent.clientY) / props.zoom) : 0,
            }));
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
        clearFocus();
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
        const target = canvasRef.current;
        const handleKeyDown = event => props?.onKeyDown?.(event);
        const handleKeyUp = event => props?.onKeyUp?.(event);
        const handlePaste = event => props?.onPaste?.(event);
        const handleResize = event => {
            const eventInfo = {
                nativeEvent: event,
            };
            if (canvasRef.current) {
                const size = canvasRef.current.getBoundingClientRect();
                setCanvasSize([size.width, size.height]);
                eventInfo.canvasWidth = size.width;
                eventInfo.canvasHeight = size.height;
            }
            props?.onResize?.(eventInfo);
        };
        // const handleWheel = event => {
        //     event.preventDefault();
        //     return props.onWheel?.(event);
        // };

        // Add events listeners
        if (target) {
            // target.addEventListener(EVENTS.WHEEL, handleWheel, {passive: false});
            target.addEventListener(EVENTS.GESTURE_START, preventDefault);
            target.addEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
            target.addEventListener(EVENTS.GESTURE_END, preventDefault);
        }
        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown);
        document.addEventListener(EVENTS.KEY_UP, handleKeyUp);
        document.addEventListener(EVENTS.PASTE, handlePaste);
        window.addEventListener(EVENTS.RESIZE, handleResize);

        // We need to call the resize for the first time
        handleResize(null);
        return () => {
            if (target) {
                // target.removeEventListener(EVENTS.WHEEL, handleWheel, {passive: false});
                target.removeEventListener(EVENTS.GESTURE_START, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_END, preventDefault);
            }
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown);
            document.removeEventListener(EVENTS.KEY_UP, handleKeyUp);
            document.removeEventListener(EVENTS.PASTE, handlePaste);
            window.removeEventListener(EVENTS.RESIZE, handleResize);
        };
    }, [props.onKeyDown, props.onKeyUp, props.onPaste]);

    // Generate transform attribute
    const transform = [
        `translate(${props.translateX}px,${props.translateY}px)`,
        `scale(${props.zoom})`,
    ];
    return (
        <div
            ref={canvasRef}
            className={props.svgClassName}
            data-id={props.id}
            data-width={props.width}
            data-height={props.height}
            style={{
                display: "block",
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
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
            <div className="absolute" style={{transform:transform.join(" ")}}>
                <style type="text/css">
                    {props.fonts.map(font => `@import url('${font}');`).join("")}
                </style>
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
                        const content = renderElement(element, {
                            ...element,
                            onChange: (keys, values) => {
                                return props?.onElementChange?.({element: element.id, keys, values});
                            },
                            onBlur: () => props?.onElementBlur?.({element: element.id}),
                            onPointerDown: e => {
                                return handlePointerDown(e, "element", props.onPointElement);
                            },
                            onDoubleClick: e => {
                                return handleDoubleClick(e, "element", props.onDoubleClickElement);
                            },
                        });
                        const style = {
                            opacity: element.erased ? "0.3" : "1.0",
                            cursor: props.cursor ? CURSORS.NONE : CURSORS.MOVE,
                        };
                        return (
                            <div key={element.id} style={style}>
                                <SvgContainer>
                                    {content}
                                </SvgContainer>
                            </div>
                        );
                    })}
                </AssetsProvider>
                {props.showBounds && props.bounds && (
                    <SvgContainer>
                        {(props.bounds || []).map((bound, index) => (
                            <path
                                key={index}
                                d={bound.path ?? ""}
                                fill={props.boundsFillColor ?? NONE}
                                stroke={bound.strokeColor ?? props.boundsStrokeColor ?? BOUNDS_STROKE_COLOR}
                                strokeWidth={(bound.strokeWidth ?? props.boundsStrokeWidth ?? BOUNDS_STROKE_WIDTH) / props.zoom}
                                strokeDasharray={(bound.strokeDasharray ?? BOUNDS_STROKE_DASH) ?? null}
                            />
                        ))}
                    </SvgContainer>
                )}
                {props.showBrush && props.brush && (
                    <SvgContainer>
                        <rect
                            x={Math.min(props.brush.x1, props.brush.x2)}
                            y={Math.min(props.brush.y1, props.brush.y2)}
                            width={Math.abs(props.brush.x2 - props.brush.x1)}
                            height={Math.abs(props.brush.y2 - props.brush.y1)}
                            fill={props.brushFillColor ?? BRUSH_FILL_COLOR}
                            fillOpacity={props.brushFillOpacity ?? BRUSH_FILL_OPACITY}
                            stroke={props.brushStrokeColor ?? BRUSH_STROKE_COLOR}
                            strokeWidth={(props.brushStrokeWidth ?? BRUSH_STROKE_WIDTH) / props.zoom}
                            strokeDasharray={(props.brushStrokeDash ?? BRUSH_STROKE_DASH) / props.zoom}
                        />
                    </SvgContainer>
                )}
                {props.showHandlers && props.handlers && (
                    <Handlers
                        handlers={props.handlers}
                        zoom={props.zoom}
                        onPointerDown={e => handlePointerDown(e, "handler", props.onPointHandler)}
                    />
                )}
                {props.showSnaps && props.snaps && (
                    <SvgContainer>
                        {props.snaps.map((item, index) => {
                            const xItems = item.points.map(p => p[0]);
                            const yItems = item.points.map(p => p[1]);
                            const start = [Math.min(...xItems), Math.min(...yItems)];
                            const end = [Math.max(...xItems), Math.max(...yItems)];
                            return (
                                <path
                                    key={`snap:edge:${item.edge}.${index}`}
                                    d={`M${start.join(",")}L${end.join(",")}`}
                                    fill={NONE}
                                    stroke={props.snapsStrokeColor ?? SNAPS_STROKE_COLOR}
                                    strokeWidth={props.snapsStrokeWidth ?? SNAPS_STROKE_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            );
                        })}
                    </SvgContainer>
                )}
                {props.showObjectDimensions && props.dimensions && (
                    <React.Fragment>
                        {(props.dimensions || []).map((item, index) => (
                            <ObjectDimensions
                                key={`prop:${index}`}
                                value={item.value}
                                x={item.x}
                                y={item.y}
                            />
                        ))}
                    </React.Fragment>
                )}
            </div>
        </div>
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
    snaps: [],
    // snapsStrokeWidth: 3,
    // snapsStrokeColor: "#3789fb",
    bounds: null,
    // boundsFillColor: NONE,
    // boundsStrokeColor: NONE,
    // boundsStrokeWidth: 2,
    handlers: null,
    brush: null,
    // brushFillColor: "#4184f4",
    // brushFillOpacity: 0.1,
    // brushStrokeColor: "#4285f4",
    // brushStrokeWidth: 2,
    // brushStrokeDash: 5,
    pointer: null,
    pointerFillColor: "#fff",
    onPointCanvas: null,
    onDoubleClickCanvas: null,
    onPointElement: null,
    onDoubleClickElement: null,
    onElementChange: null,
    onElementBlur: null,
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
    onWheel: null,
    showBounds: true,
    showHandlers: true,
    showBrush: false,
    showGrid: true,
    showPointer: false,
    showSnaps: true,
    svgStyle: {},
    svgClassName: "",
    longPressDelay: 700,
};
