import React from "react";
// import classNames from "classnames";
import {TOOLS} from "../constants.js";
import {useHandlers} from "../hooks/use-handlers.js";
import {useBounds} from "../hooks/use-bounds.js";
import {useCursor} from "../hooks/use-cursor.js";
import {useEvents} from "../hooks/use-events.js";
import {useDimensions} from "../hooks/use-dimensions.js";
import {Canvas} from "./canvas.jsx";
import {Pointer} from "./pointer.jsx";
import {EditorProvider, useEditor} from "../contexts/editor.jsx";
import {ThemeProvider} from "../contexts/theme.jsx";
// import {LibraryProvider, useLibrary} from "../contexts/library.jsx";
import {ContextMenuProvider, useContextMenu} from "../contexts/context-menu.jsx";
import {EditorComponentsProvider, useEditorComponents} from "../contexts/editor-components.jsx";
import {ConfirmProvider} from "../contexts/confirm.jsx";
import {DialogsProvider} from "../contexts/dialogs.jsx";

// @private inner editor component
const InnerEditor = () => {
    const editor = useEditor();
    const events = useEvents();
    const cursor = useCursor();
    const bounds = useBounds();
    const handlers = useHandlers();
    const dimensions = useDimensions();
    const {showContextMenu} = useContextMenu();
    const {Layout} = useEditorComponents();

    // handle context menu in canvas
    const handleContextMenu = React.useCallback(event => {
        if (editor.state.tool === TOOLS.SELECT) {
            showContextMenu(event.y, event.x);
        }
    }, [editor, editor.state.tool, showContextMenu]);

    // handle editor resize
    const handleResize = React.useCallback(event => {
        if (event?.canvasWidth && event?.canvasHeight) {
            editor.setSize(event.canvasWidth, event.canvasHeight);
            editor.update();
        }
    }, [editor]);
    
    // Hook to reset the action and tool when we change the active page
    // React.useEffect(() => {
    //     // const action = editor.state.action;
    //     if (editor.page.readonly && editor.state.tool !== TOOLS.DRAG) {
    //         handleToolOrActionChange(TOOLS.DRAG);
    //     }
    // }, [editor.page.id, editor.page.readonly, editor.state.tool]);

    return (
        <Layout>
            <Canvas
                id={editor.id}
                elements={editor.page.elements}
                assets={editor.assets}
                backgroundColor={editor.background}
                cursor={cursor}
                translateX={editor.page.translateX}
                translateY={editor.page.translateY}
                zoom={editor.page.zoom}
                snaps={editor.state.snapEdges}
                bounds={bounds}
                showBounds={!!bounds}
                handlers={handlers}
                brush={editor.state.selection}
                dimensions={dimensions}
                showBrush={editor.state.tool === TOOLS.SELECT}
                showPointer={editor.state.tool === TOOLS.ERASER}
                showGrid={editor.appState.grid}
                showSnaps={editor.appState.snapToElements}
                showObjectDimensions={editor.appState.objectDimensions}
                onContextMenu={handleContextMenu}
                onResize={handleResize}
                {...events}
            />
            {editor.state.tool === TOOLS.POINTER && (
                <Pointer />
            )}
        </Layout>
    );
};

// @description Public editor
// @param {object} props React props
// @param {object} props.components Map of editor components to override
export const Editor = props => {
    return (
        <ThemeProvider theme="default">
            <EditorComponentsProvider components={props.components}>
                <EditorProvider initialData={props.initialData} onChange={props.onChange}>
                    <ContextMenuProvider>
                        <ConfirmProvider>
                            <DialogsProvider>
                                <InnerEditor />
                            </DialogsProvider>
                        </ConfirmProvider>
                    </ContextMenuProvider>
                </EditorProvider>
            </EditorComponentsProvider>
        </ThemeProvider>
    );
};
