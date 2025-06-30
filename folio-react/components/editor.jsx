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
    const {
        Layout,
        BehindTheCanvas,
        OverTheCanvas,
    } = useEditorComponents();

    // used to track the current page id
    const currentPageId = React.useRef(editor.page.id);

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
    
    // reset the current tool when we change the current page or the readonly state
    React.useEffect(() => {
        // case 1: page is now in readonly mode and we have an edit tool selected
        if (editor.page.readonly && !(editor.state.tool === TOOLS.DRAG || editor.state.tool === TOOLS.POINTER)) {
            editor.state.tool = TOOLS.DRAG;
            editor.update();
        }
        // case 2: we have changed to a new page
        if (!editor.page.readonly && currentPageId.current !== editor.page.id) {
            editor.state.tool = TOOLS.SELECT;
            editor.update();
        }
        // make sure that we update the current page id reference
        currentPageId.current = editor.page.id;
    }, [editor.page.id, editor.page.readonly]);

    return (
        <Layout>
            {!!BehindTheCanvas && (
                <BehindTheCanvas />
            )}
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
            {!!OverTheCanvas && (
                <OverTheCanvas />
            )}
            {editor.state.tool === TOOLS.POINTER && (
                <Pointer />
            )}
        </Layout>
    );
};

// @description Public editor
// @param {object} props React props
// @param {object} props.components Map of editor components to override
// @param {object|promise|function} props.data Initial data of the editor
// @param {object|promise|function} props.library Initial library data
// @param {function} props.onChange executed each time data of the board is updated
// @param {function} props.onLibraryChange executed each time the library is updated
export const Editor = props => {
    return (
        <ThemeProvider theme="default">
            <EditorComponentsProvider components={props.components}>
                <EditorProvider {...props}>
                    <ConfirmProvider>
                        <DialogsProvider>
                            <ContextMenuProvider>
                                <InnerEditor />
                            </ContextMenuProvider>
                        </DialogsProvider>
                    </ConfirmProvider>
                </EditorProvider>
            </EditorComponentsProvider>
        </ThemeProvider>
    );
};
