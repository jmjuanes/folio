import React from "react";
import { useUpdate } from "react-use";
import {
    ACTIONS,
    IS_DARWIN,
    PREFERENCES,
    STATUS,
    TOOLS,
    CURSORS,
    EVENTS,
    FONT_SOURCES,
    NONE,
    SNAPS_STROKE_COLOR,
    SNAPS_STROKE_WIDTH,
} from "../constants.js";
import { AssetsProvider } from "../contexts/assets.jsx";
import { useEditor } from "../contexts/editor.jsx";
import { useTools } from "../contexts/tools.tsx";
import { useContextMenu } from "../contexts/context-menu.jsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useActions } from "../hooks/use-actions.js";
import { useCursor } from "../hooks/use-cursor.js";
import { getActionByKeysCombination } from "../lib/actions.js";
import { renderElement } from "./elements/index.jsx";
import { SvgContainer } from "./svg.tsx";
import { Grid } from "./grid.jsx";
import { clearFocus } from "../utils/dom.js";
import { preventDefault, isTouchOrPenEvent, isInputTarget } from "../utils/events.js";

const delay = (timeout: number, cb: () => void) => window.setTimeout(cb, timeout);

export type CanvasEvent = {
    originalX: number;
    originalY: number;
    currentX?: number; // on move
    currentY?: number; // on move
    dx?: number;       // on move
    dy?: number;       // on move
    shiftKey: boolean;
    originalEvent?: PointerEvent;
    drag?: boolean;    // true on move
};

export type CanvasProps = {
    fonts?: string[];
    longPressDelay?: number;
};

export const Canvas: React.FC<CanvasProps> = props => {
    const update = useUpdate();
    const editor = useEditor();
    const tools = useTools();
    const cursor = useCursor();
    const { showContextMenu, hideContextMenu } = useContextMenu();
    const dispatchAction = useActions();
    const preferences = usePreferences();

    editor._toolsManager = tools;
    const activeTool = tools.getActiveTool();

    const canvasRef = React.useRef<HTMLDivElement>(null);
    const longPressTimerRef = React.useRef<number>(0);
    const clearLongPressTimer = React.useCallback(() => window.clearTimeout(longPressTimerRef.current), []);
    const [canvasSize, setCanvasSize] = React.useState<[number, number]>([100, 100]);

    const handleContextMenu = React.useCallback((event: any) => {
        event.preventDefault();
        if (activeTool?.id === TOOLS.SELECT && canvasRef.current) {
            const { top, left } = canvasRef.current.getBoundingClientRect();
            showContextMenu(
                event.nativeEvent.clientY - top,
                event.nativeEvent.clientX - left
            );
        }
        return false;
    }, [activeTool, showContextMenu]);

    const handleResize = React.useCallback((event: any) => {
        if (canvasRef.current) {
            const size = canvasRef.current.getBoundingClientRect();
            setCanvasSize([size.width, size.height]);
            editor.setSize(size.width, size.height);
            editor.update();
        }
    }, [editor]);

    const onPointerDownRoute = React.useCallback((event: CanvasEvent) => {
        editor.state.status = STATUS.POINTING;
        activeTool?.onPointerDown?.(editor, event);
        hideContextMenu();
        update();
    }, [editor, activeTool, update, hideContextMenu]);

    const onPointerMoveRoute = React.useCallback((event: CanvasEvent) => {
        activeTool?.onPointerMove?.(editor, event);
        update();
    }, [editor, activeTool, update]);

    const onPointerUpRoute = React.useCallback((event: CanvasEvent) => {
        activeTool?.onPointerUp?.(editor, event);
        update();
    }, [editor, activeTool, update]);

    const onDoubleClickElement = React.useCallback((event: CanvasEvent) => {
        activeTool?.onDoubleClickElement?.(editor, event);
        update();
    }, [editor, activeTool, update]);

    const handleElementChange = React.useCallback((elementId: string, keys: string[], values: any[]) => {
        const element = editor.getElement(elementId) as any;
        if (element && element.editing) {
            editor.updateElements([element], keys, values, true);
            editor.dispatchChange();
        }
        update();
    }, [editor, update]);

    const handleElementBlur = React.useCallback((elementId: string) => {
        const element = editor.getElement(elementId) as any;
        if (element) {
            element.editing = false;
        }
        update();
    }, [editor, update]);

    const onKeyDown = React.useCallback((event: any) => {
        if (editor.page.readonly) {
            return null;
        }
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;

        // 1. Let the active tool handle the key event first
        const handled = activeTool?.onKeyDown?.(editor, event);
        if (handled) {
            update();
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
                return dispatchAction(action, { event: event });
            }
            // 4. Check for tool shortcuts
            if (!isCtrlKey && !event.shiftKey) {
                const tool = tools.getToolByShortcut(event.key);
                if (tool) {
                    event.preventDefault();
                    tools.setActiveTool(tool.id);
                }
            }
        }
    }, [editor, activeTool, update, tools, preferences, dispatchAction]);

    const onPaste = React.useCallback((event: any) => {
        if (!isInputTarget(event) && !editor.page.readonly) {
            editor.page.activeGroup = null;
            dispatchAction(ACTIONS.PASTE, { event: event });
        }
    }, [editor, dispatchAction]);

    const handlePointerDown = (event: any, source: any, pointListener: any) => {
        event.preventDefault();
        event.stopPropagation();

        // Prevent fire pointer down event if pressed button is not left
        if (event.nativeEvent.button) {
            return;
        }
        // Register timer function
        if (isTouchOrPenEvent(event)) {
            longPressTimerRef.current = delay(props.longPressDelay || 700, () => {
                document.removeEventListener("pointermove", handlePointerMove);
                document.removeEventListener("pointerup", handlePointerUp);
                document.removeEventListener("pointerleave", handlePointerUp);
                // Execute context menu handler
                return handleContextMenu(event);
            });
        }
        const { top, left } = canvasRef.current!.getBoundingClientRect();
        const eventInfo: CanvasEvent = {
            drag: false,
            originalX: (event.nativeEvent.clientX - left - editor.page.translateX) / editor.page.zoom,
            originalY: (event.nativeEvent.clientY - top - editor.page.translateY) / editor.page.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            originalEvent: event.nativeEvent,
        };

        // Emit pointer down event
        onPointerDownRoute(eventInfo);

        // Handle pointer move
        const handlePointerMove = (event: any) => {
            clearLongPressTimer();
            event.preventDefault();
            onPointerMoveRoute(Object.assign(eventInfo, {
                drag: true,
                currentEvent: event,
                currentX: (event.clientX - left - editor.page.translateX) / editor.page.zoom,
                currentY: (event.clientY - top - editor.page.translateY) / editor.page.zoom,
                dx: (event.clientX - eventInfo.originalEvent.clientX) / editor.page.zoom,
                dy: (event.clientY - eventInfo.originalEvent.clientY) / editor.page.zoom,
            }));
        };

        // Handle pointer up
        const handlePointerUp = (event: any) => {
            clearLongPressTimer();
            event.preventDefault();
            onPointerUpRoute(eventInfo);

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
    const handleDoubleClick = (event: any, source: any, listener: any) => {
        event.preventDefault();
        event.stopPropagation();

        // Prevent fire pointer down event if pressed button is not left
        if (event.nativeEvent.button) {
            return;
        }

        const { top, left } = canvasRef.current!.getBoundingClientRect();
        const eventInfo: CanvasEvent = {
            originalX: (event.nativeEvent.clientX - left - editor.page.translateX) / editor.page.zoom,
            originalY: (event.nativeEvent.clientY - top - editor.page.translateY) / editor.page.zoom,
            shiftKey: event.nativeEvent.shiftKey,
            originalEvent: event.nativeEvent,
        };

        // Get source item
        if (source && event.nativeEvent.target?.dataset?.[source]) {
            eventInfo[source] = event.nativeEvent.target.dataset[source];
        }

        // Call the provider listener and the global listener
        listener?.(eventInfo);
    };

    // Register additional events
    React.useEffect(() => {
        const target = canvasRef.current;
        // Add events listeners
        if (target) {
            target.addEventListener(EVENTS.GESTURE_START, preventDefault);
            target.addEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
            target.addEventListener(EVENTS.GESTURE_END, preventDefault);
        }
        document.addEventListener(EVENTS.KEY_DOWN, onKeyDown);
        document.addEventListener(EVENTS.PASTE, onPaste);
        window.addEventListener(EVENTS.RESIZE, handleResize);

        // We need to call the resize for the first time
        handleResize(null);
        return () => {
            if (target) {
                target.removeEventListener(EVENTS.GESTURE_START, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_CHANGE, preventDefault);
                target.removeEventListener(EVENTS.GESTURE_END, preventDefault);
            }
            document.removeEventListener(EVENTS.KEY_DOWN, onKeyDown);
            document.removeEventListener(EVENTS.PASTE, onPaste);
            window.removeEventListener(EVENTS.RESIZE, handleResize);
        };
    }, [onKeyDown, onPaste, handleResize]);

    // Generate transform attribute
    const transform = [
        `translate(${editor.page.translateX}px,${editor.page.translateY}px)`,
        `scale(${editor.page.zoom})`,
    ];
    return (
        <div
            ref={canvasRef}
            data-id={editor.id}
            style={{
                display: "block",
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor: editor.background,
                touchAction: "none",
                userSelect: "none",
                WebkitTouchCallout: "none",
                cursor: cursor as any,
            }}
            onPointerDown={e => handlePointerDown(e, null, null)}
            onDoubleClick={e => handleDoubleClick(e, null, null)}
            onContextMenu={e => handleContextMenu(e)}
        >
            <div className="absolute" style={{ transform: transform.join(" ") }}>
                <style type="text/css">
                    {(props.fonts || Object.values(FONT_SOURCES)).map(font => `@import url('${font}');`).join("")}
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
                                return handleDoubleClick(e, "element", onDoubleClickElement);
                            },
                        });
                        const style = {
                            opacity: element.erased ? "0.3" : "1.0",
                            cursor: cursor ? CURSORS.NONE : CURSORS.MOVE,
                        };
                        return (
                            <div key={element.id} style={style as React.CSSProperties}>
                                <SvgContainer>
                                    {content}
                                </SvgContainer>
                            </div>
                        );
                    })}
                </AssetsProvider>

                {activeTool?.renderCanvas?.(editor)}
            </div>
        </div>
    );
};
