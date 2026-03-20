import React from "react";
import { useUpdate } from "react-use";
import { ACTIONS, IS_DARWIN, KEYS, PREFERENCES, STATUS, TOOLS } from "../constants.js";
// Handlers moved to SelectTool
import { useCursor } from "../hooks/use-cursor.js";
import { useDimensions } from "../hooks/use-dimensions.ts";
import { Canvas } from "./canvas.jsx";
import { EditorProvider, useEditor } from "../contexts/editor.jsx";
import { ContextMenuProvider, useContextMenu } from "../contexts/context-menu.jsx";
import { SurfaceProvider } from "../contexts/surface.tsx";
import {
    EditorComponentsProvider,
    useEditorComponents,
} from "../contexts/editor-components.tsx";
import { ConfirmProvider } from "../contexts/confirm.jsx";
import { DialogsProvider } from "../contexts/dialogs.tsx";
import { LibraryProvider } from "../contexts/library.tsx";
import { PreferencesProvider, usePreferences } from "../contexts/preferences.tsx";
import { ToolsProvider, useTools } from "../contexts/tools.tsx";
import { defaultTools } from "../tools/index.tsx";
import { useActions } from "../hooks/use-actions.js";
import { getActionByKeysCombination } from "../lib/actions.js";
import { isInputTarget } from "../utils/events.js";

// @private inner editor component
const InnerEditor = () => {
    const update = useUpdate();
    const editor = useEditor();
    const tools = useTools();
    const cursor = useCursor();
// Handlers computing moved to SelectTool
    const dimensions = useDimensions();
    const { showContextMenu, hideContextMenu } = useContextMenu();
    const dispatchAction = useActions();
    const preferences = usePreferences();
    const {
        Layout,
        BehindTheCanvas,
        OverTheCanvas,
    } = useEditorComponents();

    // Expose toolsManager on editor so tools can access it (e.g., for tool switching)
    editor._toolsManager = tools;

    const activeTool = tools.getActiveTool();

    // handle context menu in canvas
    const handleContextMenu = React.useCallback(event => {
        if (activeTool?.id === TOOLS.SELECT) {
            showContextMenu(event.y, event.x);
        }
    }, [activeTool, showContextMenu]);

    // handle editor resize
    const handleResize = React.useCallback(event => {
        if (event?.canvasWidth && event?.canvasHeight) {
            editor.setSize(event.canvasWidth, event.canvasHeight);
            editor.update();
        }
    }, [editor]);

    // --- Event routing to active tool ---

    const onPointCanvas = React.useCallback(event => {
        activeTool?.onPointCanvas?.(editor, activeTool, event);
        hideContextMenu();
        update();
    }, [editor, activeTool, update, hideContextMenu]);

    const onPointElement = React.useCallback(event => {
        activeTool?.onPointElement?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onPointerDown = React.useCallback(event => {
        editor.state.status = STATUS.POINTING;
        activeTool?.onPointerDown?.(editor, activeTool, event);
        hideContextMenu();
        update();
    }, [editor, activeTool, update, hideContextMenu]);

    const onPointerMove = React.useCallback(event => {
        activeTool?.onPointerMove?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onPointerUp = React.useCallback(event => {
        activeTool?.onPointerUp?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onDoubleClickElement = React.useCallback(event => {
        activeTool?.onDoubleClickElement?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onElementChange = React.useCallback(event => {
        activeTool?.onElementChange?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onElementBlur = React.useCallback(event => {
        activeTool?.onElementBlur?.(editor, activeTool, event);
        update();
    }, [editor, activeTool, update]);

    const onKeyDown = React.useCallback(event => {
        if (editor.page.readonly) {
            return null;
        }
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;

        // 1. Let the active tool handle the key event first
        const handled = activeTool?.onKeyDown?.(editor, activeTool, event);
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

    const onPaste = React.useCallback(event => {
        if (!isInputTarget(event) && !editor.page.readonly) {
            editor.page.activeGroup = null;
            dispatchAction(ACTIONS.PASTE, { event: event });
        }
    }, [editor, dispatchAction]);

    return (
        <Layout>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
            <Canvas
                id={editor.id}
                elements={editor.getElements()}
                assets={editor.assets}
                backgroundColor={editor.background}
                cursor={cursor}
                translateX={editor.page.translateX}
                translateY={editor.page.translateY}
                zoom={editor.page.zoom}
                snaps={editor.state.snapEdges}
                // Handlers computing moved to SelectTool
                dimensions={dimensions}
                showGrid={editor.appState.grid}
                showSnaps={editor.appState.snapToElements}
                showObjectDimensions={editor.appState.objectDimensions}
                showPointer={activeTool?.id === TOOLS.ERASER}
                onContextMenu={handleContextMenu}
                onResize={handleResize}
                onPointCanvas={onPointCanvas}
                onPointElement={onPointElement}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onDoubleClickElement={onDoubleClickElement}
                onElementChange={onElementChange}
                onElementBlur={onElementBlur}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
            >
                {activeTool?.renderCanvas?.(editor, activeTool)}
            </Canvas>
            {!!OverTheCanvas && (
                <OverTheCanvas />
            )}
        </Layout>
    );
};

// @description Public editor
// @param {object} props React props
// @param {object} props.components Map of editor components to override
// @param {object|promise|function} props.data Initial data of the editor
// @param {object|promise|function} props.library Initial library data
// @param {object} props.preferences - initial preferences data
// @param {Array} props.tools - array of tool definitions (defaults to defaultTools)
// @param {function} props.onChange executed each time data of the board is updated
// @param {function} props.onLibraryChange executed each time the library is updated
export const Editor = props => {
    return (
        <PreferencesProvider preferences={props.preferences}>
            <EditorComponentsProvider components={props.components}>
                <LibraryProvider data={props.library} onChange={props.onLibraryChange}>
                    <EditorProvider {...props}>
                        <ToolsProvider tools={props.tools || defaultTools}>
                            <ConfirmProvider>
                                <DialogsProvider>
                                    <SurfaceProvider>
                                        <ContextMenuProvider>
                                            <InnerEditor />
                                        </ContextMenuProvider>
                                    </SurfaceProvider>
                                </DialogsProvider>
                            </ConfirmProvider>
                        </ToolsProvider>
                    </EditorProvider>
                </LibraryProvider>
            </EditorComponentsProvider>
        </PreferencesProvider>
    );
};
