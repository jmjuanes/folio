import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import {
    ACTIONS,
    IS_DARWIN,
    PREFERENCES,
    TOOLS,
    CURSORS,
    EVENTS,
    FONT_SOURCES,
    ZOOM_MIN,
    ZOOM_MAX,
    ZOOM_STEP,
} from "../constants.js";
import { getTranslateCoordinatesForZoomAtPoint } from "../lib/zoom.ts";
import { AssetsProvider } from "../contexts/assets.jsx";
import { useEditor } from "../contexts/editor.tsx";
import { useTools } from "../contexts/tools.tsx";
import { useContextMenu } from "../hooks/use-context-menu.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useActions } from "../contexts/actions.tsx";
import { useCursor } from "../hooks/use-cursor.js";
import { renderElement } from "./elements/index.jsx";
import { SvgContainer } from "./svg.tsx";
import { Grid } from "./grid.jsx";
import { clearFocus } from "../utils/dom.js";
import { preventDefault, isTouchOrPenEvent, isInputTarget } from "../utils/events.js";
import type { EditorPointEvent, EditorKeyboardEvent } from "../lib/events.ts";
import type { JSX, ReactNode, CSSProperties } from "react";

const delay = (timeout: number, cb: () => void) => window.setTimeout(cb, timeout);

export type CanvasProps = {
    fonts?: string[];
    longPressDelay?: number;
    children?: ReactNode;
};

export const Canvas = (props: CanvasProps): JSX.Element => {
    const editor = useEditor();
    const { getToolByShortcut } = useTools();
    const cursor = useCursor();
    const { showContextMenu, hideContextMenu } = useContextMenu();
    const { dispatchAction, getActionByKeysCombination } = useActions();
    const preferences = usePreferences();
    const isMultiTouchRef = useRef<boolean>(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const longPressTimerRef = useRef<number>(0);
    const clearLongPressTimer = useCallback(() => {
        window.clearTimeout(longPressTimerRef.current);
    }, []);

    // Touch state refs for pinch-to-zoom and two-finger pan
    const touchStateRef = useRef<{
        touches: { id: number; x: number; y: number }[];
        lastDist: number;
        lastMidX: number;
        lastMidY: number;
    } | null>(null);
    const [canvasSize, setCanvasSize] = useState<[number, number]>([100, 100]);
    const activeTool = editor.activeTool;

    const handleContextMenu = useCallback((event: any) => {
        event.preventDefault();
        if (!isMultiTouchRef.current && activeTool?.id === TOOLS.SELECT && canvasRef.current) {
            const { top, left } = canvasRef.current.getBoundingClientRect();
            showContextMenu(
                event.nativeEvent.clientY - top,
                event.nativeEvent.clientX - left
            );
        }
        return false;
    }, [activeTool, showContextMenu]);

    const handleResize = useCallback(() => {
        if (canvasRef.current) {
            const size = canvasRef.current.getBoundingClientRect();
            setCanvasSize([size.width, size.height]);
            editor.setSize(size.width, size.height);
            editor.update();
        }
    }, [editor, setCanvasSize]);

    const handleElementChange = useCallback((elementId: string, keys: string[], values: any[]) => {
        const element = editor.getElement(elementId) as any;
        if (element && element.editing) {
            editor.updateElements([element], keys, values, true);
            editor.dispatchChange();
            editor.update();
        }
    }, [editor]);

    const handleElementBlur = useCallback((elementId: string) => {
        const element = editor.getElement(elementId) as any;
        if (element) {
            element.editing = false;
        }
        editor.update();
    }, [editor]);

    const handleKeyDown = useCallback((event: any) => {
        if (editor.page.readonly) {
            return null;
        }
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        const activeTool = editor.getCurrentTool();

        // 1. Let the active tool handle the key event first
        const handled = activeTool.dispatch("keyDown", {
            key: event.key,
            shiftKey: !!event.shiftKey,
            ctrlKey: IS_DARWIN ? event.metaKey : event.ctrlKey,
            nativeEvent: event,
        } as EditorKeyboardEvent);

        if (handled) {
            editor.update();
            return;
        }

        // 2. Check if we are in an input target (and active tool didn't handle it)
        if (isInputTarget(event)) {
            return;
        }

        // 3. Check for action shortcuts
        if (!!preferences[PREFERENCES.KEYBOARD_SHORTCUTS_ENABLED]) {
            const action = getActionByKeysCombination(event.key, event.code, isCtrlKey, event.altKey, event.shiftKey);
            if (action) {
                event.preventDefault();
                if (typeof action.disabled === "undefined" || !action.disabled) {
                    return dispatchAction(action.id, { event: event });
                }
            }
            // 4. Check for tool shortcuts
            if (!isCtrlKey && !event.shiftKey) {
                const tool = getToolByShortcut(event.key);
                if (tool && typeof tool?.onSelect === "function") {
                    event.preventDefault();
                    tool.onSelect();
                }
            }
        }
    }, [editor, activeTool, getToolByShortcut, preferences, dispatchAction, getActionByKeysCombination]);

    const handleKeyUp = useCallback((event: any) => {
        editor.getCurrentTool().dispatch("keyUp", {
            key: event.key,
            shiftKey: !!event.shiftKey,
            ctrlKey: IS_DARWIN ? event.metaKey : event.ctrlKey,
            nativeEvent: event,
        } as EditorKeyboardEvent);
        editor.update();
    }, [editor]);

    const handlePaste = useCallback((event: any) => {
        if (!isInputTarget(event) && !editor.page.readonly) {
            editor.page.activeGroup = null;
            dispatchAction(ACTIONS.PASTE, { event: event });
        }
    }, [editor, dispatchAction]);

    const handlePointerDown = useCallback((event: any, source: any, pointListener: any) => {
        event.preventDefault();
        event.stopPropagation();

        // prevent fire pointer down event if pressed button is not left
        // also prevents dispatching this event if we are handing a multi-touch event
        if (event.nativeEvent.button || isMultiTouchRef.current) {
            return;
        }
        // Register timer function
        if (isTouchOrPenEvent(event) && !isMultiTouchRef.current) {
            clearLongPressTimer(); // reset previous timer
            longPressTimerRef.current = delay(props.longPressDelay || 700, () => {
                document.removeEventListener("pointermove", handlePointerMove);
                document.removeEventListener("pointerup", handlePointerUp);
                document.removeEventListener("pointerleave", handlePointerUp);
                // Execute context menu handler
                return handleContextMenu(event);
            });
        }
        const { top, left } = canvasRef.current!.getBoundingClientRect();
        const eventInfo: EditorPointEvent = {
            originalX: (event.nativeEvent.clientX - left - editor.page.translateX) / editor.page.zoom,
            originalY: (event.nativeEvent.clientY - top - editor.page.translateY) / editor.page.zoom,
            dx: 0,
            dy: 0,
            shiftKey: event.nativeEvent.shiftKey,
            nativeEvent: event.nativeEvent,
        };

        // Emit pointer down event
        editor.getCurrentTool().dispatch("pointerDown", eventInfo);
        editor.update();
        hideContextMenu();

        // Handle pointer move
        const handlePointerMove = (event: any) => {
            clearLongPressTimer();
            event.preventDefault();

            // check if we have to cancel the event if a multitouch event is currently handled
            if (isMultiTouchRef.current) {
                editor.getCurrentTool().dispatch("pointerCancel");
                editor.update(); // required to remove visual elements of the tool
                cancelPointerEventsListeners();
                return;
            }

            // dispatch pointer move event
            editor.getCurrentTool().dispatch("pointerMove", Object.assign({}, eventInfo, {
                nativeEvent: event,
                currentX: (event.clientX - left - editor.page.translateX) / editor.page.zoom,
                currentY: (event.clientY - top - editor.page.translateY) / editor.page.zoom,
                dx: eventInfo.nativeEvent ? (event.clientX - eventInfo.nativeEvent.clientX) / editor.page.zoom : 0,
                dy: eventInfo.nativeEvent ? (event.clientY - eventInfo.nativeEvent.clientY) / editor.page.zoom : 0,
            }));
            editor.update();
        };

        // Handle pointer up
        const handlePointerUp = (event: any) => {
            clearLongPressTimer();
            event.preventDefault();
            editor.getCurrentTool().dispatch("pointerUp", Object.assign({}, eventInfo, {
                nativeEvent: event,
            }));
            editor.update();
            cancelPointerEventsListeners();
        };

        // cancel events listeners
        const cancelPointerEventsListeners = () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointerleave", handlePointerUp);
        };

        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
        clearFocus();
    }, [editor, handleContextMenu, hideContextMenu]);

    // Handle double click
    const handleDoubleClick = useCallback((event: any, source: any, listener: any) => {
        event.preventDefault();
        event.stopPropagation();

        // Prevent fire pointer down event if pressed button is not left
        if (event.nativeEvent.button) {
            return;
        }

        const { top, left } = canvasRef.current!.getBoundingClientRect();
        const eventInfo: EditorPointEvent = {
            originalX: (event.nativeEvent.clientX - left - editor.page.translateX) / editor.page.zoom,
            originalY: (event.nativeEvent.clientY - top - editor.page.translateY) / editor.page.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            dx: 0,
            dy: 0,
            nativeEvent: event.nativeEvent,
        };

        // Get source item
        // if (source && (event.nativeEvent.target as HTMLElement)?.dataset?.[source]) {
        //     (eventInfo as any)[source] = (event.nativeEvent.target as HTMLElement).dataset[source];
        // }

        // Call the provider listener and the global listener
        // listener?.(eventInfo);
        editor.getCurrentTool().dispatch("doubleClick", eventInfo);
        editor.update();
    }, [editor]);

    // Handle mouse-wheel: Ctrl/Cmd+wheel → zoom at cursor; shift+wheel → pan X; plain wheel → pan Y
    // Note: on macOS, pinch-to-zoom on a trackpad also fires wheel events with ctrlKey=true,
    // so this handler covers both mouse-wheel and trackpad pinch gestures.
    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        if (!canvasRef.current || !preferences[PREFERENCES.GESTURES_WHEEL]) {
            return;
        }
        // ctrlKey is set by browsers for trackpad pinch gestures on macOS too
        const isZoomGesture = event.ctrlKey || (IS_DARWIN && event.metaKey);
        if (isZoomGesture) {
            // Zoom centred on the cursor / pinch focal point
            const { top, left } = canvasRef.current.getBoundingClientRect();
            const pointX = event.clientX - left;
            const pointY = event.clientY - top;
            // Use proportional scaling for smooth trackpad, fixed step for mouse wheel
            // Clamp deltaY to avoid extreme jumps on discrete wheels
            const delta = Math.abs(event.deltaY) > 10 ? (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP) : -event.deltaY * 0.01;
            const newZoom = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, editor.page.zoom + delta)) * 100) / 100;
            const { zoom, translateX, translateY } = getTranslateCoordinatesForZoomAtPoint(newZoom, pointX, pointY, {
                zoom: editor.page.zoom,
                translateX: editor.page.translateX,
                translateY: editor.page.translateY,
            });
            editor.page.zoom = zoom;
            editor.page.translateX = translateX;
            editor.page.translateY = translateY;
        } else if (event.shiftKey) {
            // Shift+wheel → horizontal pan
            editor.page.translateX -= event.deltaY;
        } else {
            // Plain scroll → pan (deltaX for horizontal trackpad scrolling)
            editor.page.translateX -= event.deltaX;
            editor.page.translateY -= event.deltaY;
        }
        editor.update();
    }, [editor, preferences[PREFERENCES.GESTURES_WHEEL]]);

    // Handle touch start: track touches for pinch/pan detection
    const handleTouchStart = useCallback((event: TouchEvent) => {
        if (event.touches.length >= 2 && preferences[PREFERENCES.GESTURES_PINCH]) {
            event.preventDefault();

            // set touch as active and clear long-press event
            isMultiTouchRef.current = true;
            clearLongPressTimer();

            const t0 = event.touches[0];
            const t1 = event.touches[1];
            const midX = (t0.clientX + t1.clientX) / 2;
            const midY = (t0.clientY + t1.clientY) / 2;
            const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
            touchStateRef.current = {
                touches: [
                    { id: t0.identifier, x: t0.clientX, y: t0.clientY },
                    { id: t1.identifier, x: t1.clientX, y: t1.clientY },
                ],
                lastDist: dist,
                lastMidX: midX,
                lastMidY: midY,
            };
        }
    }, [preferences[PREFERENCES.GESTURES_PINCH]]);

    // Handle touch move: pinch-to-zoom and two-finger pan
    const handleTouchMove = useCallback((event: TouchEvent) => {
        if (event.touches.length < 2 || !touchStateRef.current || !canvasRef.current || !preferences[PREFERENCES.GESTURES_PINCH]) {
            return;
        }
        event.preventDefault();
        const t0 = event.touches[0];
        const t1 = event.touches[1];
        const { top, left } = canvasRef.current.getBoundingClientRect();

        const midX = (t0.clientX + t1.clientX) / 2 - left;
        const midY = (t0.clientY + t1.clientY) / 2 - top;
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);

        const { lastDist, lastMidX, lastMidY } = touchStateRef.current;
        const scaleFactor = dist / lastDist;
        const newZoom = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, editor.page.zoom * scaleFactor)) * 100) / 100;

        // 1. Apply pinch zoom centred on the midpoint
        const { zoom, translateX, translateY } = getTranslateCoordinatesForZoomAtPoint(newZoom, midX, midY, {
            zoom: editor.page.zoom,
            translateX: editor.page.translateX,
            translateY: editor.page.translateY,
        });

        // 2. Apply pan delta (difference in midpoint)
        const panDx = midX - lastMidX;
        const panDy = midY - lastMidY;

        editor.page.zoom = zoom;
        editor.page.translateX = translateX + panDx;
        editor.page.translateY = translateY + panDy;

        touchStateRef.current = { ...touchStateRef.current, lastDist: dist, lastMidX: midX, lastMidY: midY };
        editor.update();
    }, [editor, preferences[PREFERENCES.GESTURES_PINCH]]);

    // Handle touch end: clear touch state when fingers lift
    const handleTouchEnd = useCallback((event: TouchEvent) => {
        if (event.touches.length < 2 && preferences[PREFERENCES.GESTURES_PINCH]) {
            touchStateRef.current = null;
            // little delay to prevent additional actions dispatched by the last finger
            delay(100, () => {
                clearLongPressTimer();
                isMultiTouchRef.current = false;
            });
        }
    }, [preferences[PREFERENCES.GESTURES_PINCH]]);

    // Register additional events
    useEffect(() => {
        const target = canvasRef.current;
        // Add events listeners
        if (target) {
            target.addEventListener(EVENTS.GESTURE_START, preventDefault);
            target.addEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
            target.addEventListener(EVENTS.GESTURE_END, preventDefault);
            // Wheel must be registered with { passive: false } to allow preventDefault()
            target.addEventListener(EVENTS.WHEEL, handleWheel as EventListener, { passive: false });
            // Touch events for pinch/pan
            target.addEventListener(EVENTS.TOUCH_START, handleTouchStart as EventListener, { passive: false });
            target.addEventListener(EVENTS.TOUCH_MOVE, handleTouchMove as EventListener, { passive: false });
            target.addEventListener(EVENTS.TOUCH_END, handleTouchEnd as EventListener);
        }
        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown);
        document.addEventListener(EVENTS.KEY_UP, handleKeyUp);
        document.addEventListener(EVENTS.PASTE, handlePaste);
        window.addEventListener(EVENTS.RESIZE, handleResize);

        // We need to call the resize for the first time
        handleResize();
        return () => {
            if (target) {
                target.removeEventListener(EVENTS.GESTURE_START, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_END, preventDefault);
                target.removeEventListener(EVENTS.WHEEL, handleWheel as EventListener);
                target.removeEventListener(EVENTS.TOUCH_START, handleTouchStart as EventListener);
                target.removeEventListener(EVENTS.TOUCH_MOVE, handleTouchMove as EventListener);
                target.removeEventListener(EVENTS.TOUCH_END, handleTouchEnd as EventListener);
            }
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown);
            document.removeEventListener(EVENTS.KEY_UP, handleKeyUp);
            document.removeEventListener(EVENTS.PASTE, handlePaste);
            window.removeEventListener(EVENTS.RESIZE, handleResize);
        };
    }, [handleKeyDown, handleKeyUp, handlePaste, handleResize, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // generate canvas style
    const canvasStyle = useMemo(() => ({
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: editor.background,
        touchAction: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        cursor: cursor as string,
    } as CSSProperties), [editor.background, cursor]);

    // generate transform attribute
    const transform = [
        `translate(${editor.page.translateX}px,${editor.page.translateY}px)`,
        `scale(${editor.page.zoom})`,
    ];
    const fonts = props.fonts || Object.values(FONT_SOURCES) || [] as string[];
    return (
        <div
            ref={canvasRef}
            data-id={editor.id}
            style={canvasStyle}
            onPointerDown={e => handlePointerDown(e, null, null)}
            onDoubleClick={e => handleDoubleClick(e, null, null)}
            onContextMenu={e => handleContextMenu(e)}
        >
            <div className="absolute" style={{ transform: transform.join(" ") }}>
                <style type="text/css">
                    {fonts.map(font => `@import url('${font}');`).join("")}
                </style>
                {editor.appState.grid && (
                    <Grid
                        translateX={editor.page.translateX}
                        translateY={editor.page.translateY}
                        zoom={editor.page.zoom}
                        width={canvasSize[0]}
                        height={canvasSize[1]}
                    />
                )}
                <AssetsProvider value={editor.assets || {}}>
                    {editor.getElements().map((element: any) => {
                        const content = renderElement(element, {
                            ...element,
                            onChange: (keys: any, values: any) => {
                                return handleElementChange(element.id, keys, values);
                            },
                            onBlur: () => {
                                return handleElementBlur(element.id);
                            },
                            onPointerDown: (e: any) => {
                                return handlePointerDown(e, "element", null);
                            },
                            onDoubleClick: (e: any) => {
                                return handleDoubleClick(e, "element", null);
                            },
                        });
                        const style = {
                            opacity: element.erased ? "0.3" : "1.0",
                            cursor: cursor ? CURSORS.NONE : CURSORS.MOVE,
                        };
                        return (
                            <div key={element.id} style={style as CSSProperties}>
                                <SvgContainer>
                                    {content}
                                </SvgContainer>
                            </div>
                        );
                    })}
                </AssetsProvider>
                {props.children}
            </div>
        </div>
    );
};
