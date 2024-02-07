import React from "react";
import {fileOpen} from "browser-fs-access";
import {BarsIcon, CameraIcon} from "@josemi-icons/react";
import {
    ACTIONS,
    ELEMENTS,
    FILE_EXTENSIONS,
    SELECT_BOUNDS_FILL_COLOR,
    SELECT_BOUNDS_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    STATES,
    ZOOM_STEP,
} from "@lib/constants.js";
import {blobToDataUrl} from "@lib/utils/blob.js";
import {
    getTextFromClipboard,
    copyTextToClipboard,
    getTextFromClipboardItem,
    getBlobFromClipboardItem,
} from "@lib/utils/clipboard.js";
import {useHandlers} from "@hooks/use-handlers.js";
import {useBounds} from "@hooks/use-bounds.js";
import {useCursor} from "@hooks/use-cursor.js";
import {useEditor} from "@hooks/use-editor.js";
import {HeaderContainer, HeaderButton} from "./commons/header.jsx";
import {Canvas} from "./canvas.jsx";
import {ContextMenu} from "./ui/context-menu.jsx";
import {Menu} from "./ui/menu.jsx";
import {Title} from "./ui/title.jsx";
import {Hint} from "./ui/hint.jsx";
import {ExportDialog} from "./dialogs/export.jsx";
import {ToolsPanel} from "./panels/tools.jsx";
import {EditionPanel} from "./panels/edition.jsx";
import {ZoomPanel} from "./panels/zoom.jsx";
import {HistoryPanel} from "./panels/history.jsx";
import {useConfirm} from "@contexts/confirm.jsx";
import {SceneProvider, useScene} from "@contexts/scene.jsx";

// @private
const EditorWithScene = props => {
    const scene = useScene();
    const editor = useEditor(props);
    const {showConfirm} = useConfirm();
    const cursor = useCursor(editor.state);
    const bounds = useBounds(editor.state);
    const handlers = useHandlers(editor.state);

    const selectedElements = scene.getSelection();
    const isScreenshot = editor.state.action === ACTIONS.SCREENSHOT;
    const isPresentation = !!editor.state.settings.presentationMode;

    // Handle board reset
    const handleResetBoard = () => {
        return showConfirm({
            title: "Clear board",
            message: "This will clear the whole board. Do you want to continue?",
            callback: () => {
                scene.clearHistory();
                scene.clearElements();
                editor.dispatchChange();
                editor.update();
            },
        });
    };
    // Handle image load
    const handleImageLoad = () => {
        const options = {
            description: "Folio Board",
            extensions: [
                FILE_EXTENSIONS.PNG,
                FILE_EXTENSIONS.JPG,
            ],
            multiple: false,
        };
        fileOpen(options)
            .then(blob => blobToDataUrl(blob))
            .then(data => scene.addImageElement(data))
            .then(() => {
                editor.dispatchChange();
                editor.update();
            })
            .catch(error => console.error(error));
    };

    // Handle tool or action change
    const handleToolOrActionChange = React.useCallback((newTool, newAction) => {
        editor.state.tool = newTool;
        editor.state.action = newAction;
        scene.getElements().forEach(element => {
            element.selected = false;
            element.editing = false;
        });
        editor.update();
    }, []);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (editor.state.welcomeHintsVisible && scene?.elements?.length > 0) {
            editor.state.welcomeHintsVisible = false;
            editor.update();
        }
    }, [scene?.elements?.length]);

    return (
        <div className="relative overflow-hidden h-full w-full select-none">
            <Canvas
                id={scene.id}
                elements={scene.elements}
                assets={scene.assets}
                backgroundColor={scene.background}
                cursor={cursor}
                translateX={scene.translateX}
                translateY={scene.translateY}
                zoom={scene.zoom}
                bounds={bounds}
                boundsFillColor={SELECT_BOUNDS_FILL_COLOR}
                boundsStrokeColor={SELECT_BOUNDS_STROKE_COLOR}
                showBounds={!!bounds}
                handlers={handlers}
                brush={editor.state.selection}
                brushFillColor={SELECTION_FILL_COLOR}
                brushStrokeColor={SELECTION_STROKE_COLOR}
                showBrush={editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT}
                showPointer={editor.state.action === ACTIONS.ERASE}
                showGrid={editor.state.settings.grid}
                {...editor.events}
            />
            {(editor.state.contextMenu.visible && !isPresentation) &&  (
                <ContextMenu
                    top={editor.state.contextMenu.top}
                    left={editor.state.contextMenu.left}
                    onDuplicate={() => {
                        scene.duplicateElements(scene.getSelection());
                        editor.state.contextMenu.visible = false;
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onLock={() => {
                        scene.lockElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onUnlock={() => {
                        scene.unlockElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onCut={() => {
                        const elements = scene.getSelection();
                        scene.cutElementsToClipboard(elements).then(() => {
                            editor.state.contextMenu.visible = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onCopy={() => {
                        const elements = scene.getSelection();
                        scene.copyElementsToClipboard(elements).then(() => {
                            editor.state.contextMenu.visible = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onPaste={() => {
                        const x = editor.state.contextMenu.left;
                        const y = editor.state.contextMenu.top;
                        scene.pasteElementsFromClipboard(null, {x, y}).then(() => {
                            editor.state.contextMenu.visible = false;
                            editor.dispatchChange();
                            editor.update();
                        });
                    }}
                    onSendBackward={() => {
                        scene.sendElementsBackward(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onBringForward={() => {
                        scene.bringElementsForward(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                    onSelectAll={() => {
                        scene.getElements().forEach(el => el.selected = true);
                        editor.update();
                    }}
                    onDelete={() => {
                        scene.removeElements(scene.getSelection());
                        editor.dispatchChange();
                        editor.update();
                    }}
                />
            )}
            {props.showTools && !isScreenshot && !isPresentation && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
                        action={editor.state.action}
                        tool={editor.state.tool}
                        toolLocked={editor.state.toolLocked}
                        showSelect={!isPresentation}
                        showTools={!isPresentation}
                        showLock={!isPresentation}
                        onPointerClick={() => {
                            // board.setTool(null);
                            // board.setAction(ACTIONS.POINTER);
                            // board.update();
                        }}
                        onMoveClick={() => {
                            handleToolOrActionChange(null, ACTIONS.MOVE);
                        }}
                        onEraseClick={() => {
                            handleToolOrActionChange(null, ACTIONS.ERASE);
                        }}
                        onSelectionClick={() => {
                            handleToolOrActionChange(null, ACTIONS.SELECT);
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return handleImageLoad();
                            }
                            handleToolOrActionChange(tool, null);
                        }}
                        onToolLockClick={() => {
                            editor.state.toolLocked = !editor.state.toolLocked;
                            editor.update();
                        }}
                    />
                    {(editor.state.welcomeHintsVisible && !editor.state.tool && !isPresentation) && (
                        <Hint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {props.showEdition && editor.state.currentState === STATES.IDLE && selectedElements.length > 0 && (
                <React.Fragment>
                    {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                        <div className="absolute z-6 top-0 mt-16 right-0 pt-1 pr-6">
                            <EditionPanel
                                key={selectedElements.map(el => el.id).join("-")}
                                onChange={() => {
                                    editor.dispatchChange();
                                    editor.update();
                                }}
                            />
                        </div>
                    )}
                </React.Fragment>
            )}
            {props.showHeader && !isScreenshot && (
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-7 flex gap-2">
                        <div className="relative flex">
                            <HeaderContainer>
                                {props.showMenu && (
                                    <Menu
                                        settings={editor.state.settings}
                                        links={props.links}
                                        showLinks={props.showLinks}
                                        showLoad={props.showLoad}
                                        showSave={props.showSave}
                                        showResetBoard={props.showResetBoard}
                                        showChangeBackground={props.showChangeBackground}
                                        showSettings={props.showSettings}
                                        showExport={props.showExport}
                                        onChange={props.onChange}
                                        onSave={props.onSave}
                                        onLoad={props.onLoad}
                                        onResetBoard={handleResetBoard}
                                        onExport={() => setExportVisible(true)}
                                        onBackgroundChange={newBackground => {
                                            scene.background = newBackground;
                                            editor.dispatchChange();
                                            editor.update();
                                        }}
                                        onGridToggle={() => {
                                            editor.state.settings.grid = !editor.state.settings.grid;
                                            editor.update();
                                        }}
                                        onPresentationToggle={() => {
                                            editor.state.settings.presentationMode = !editor.state.settings.presentationMode;
                                            handleToolOrActionChange(null, ACTIONS.MOVE);
                                        }}
                                    />
                                )}
                                {props.showMenu && (props.showTitle || props.showScreenshot) && (
                                    <div className="w-px bg-neutral-200" />
                                )}
                                {props.showTitle && (
                                    <Title
                                        title={scene.title}
                                        editable={!isPresentation}
                                        onChange={newTitle => {
                                            scene.title = newTitle;
                                            editor.dispatchChange();
                                        }}
                                    />
                                )}
                                {props.showScreenshot && !isPresentation && (
                                    <HeaderButton
                                        icon="camera"
                                        disabled={scene.getElements().length === 0}
                                        onClick={() => {
                                            handleToolOrActionChange(null, ACTIONS.SCREENSHOT);
                                        }}
                                    />
                                )}
                            </HeaderContainer>
                            {(editor.state.welcomeHintsVisible && !editor.state.tool && !isPresentation) && (
                                <Hint position="bottom" title="Actions" contentClassName="w-48">
                                    <div className="flex items-center justify-center gap-2">
                                        <BarsIcon />
                                        <span>Export, save, and configure.</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <CameraIcon />
                                        <span>Take a screenshot.</span>
                                    </div>
                                </Hint>
                            )}
                        </div>
                        {props.headerLeftContent}
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-6 z-7 flex gap-2">
                        {props.showHistory && !isPresentation && (
                            <div className="flex relative">
                                <HistoryPanel
                                    undoDisabled={!scene.canUndo()}
                                    redoDisabled={!scene.canRedo()}
                                    onUndoClick={() => {
                                        scene.undo();
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                    onRedoClick={() => {
                                        scene.redo();
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                />
                                {(editor.state.welcomeHintsVisible && !editor.state.tool) && (
                                    <Hint
                                        position="bottom"
                                        title="History"
                                        contentClassName="w-24 text-center"
                                        content="Undo and redo changes."
                                    />
                                )}
                            </div>
                        )}
                        {props.showZoom && (
                            <div className="flex relative">
                                <ZoomPanel
                                    zoom={scene.getZoom()}
                                    onZoomInClick={() => {
                                        scene.setZoom(scene.zoom + ZOOM_STEP);
                                        editor.update();
                                    }}
                                    onZoomOutClick={() => {
                                        scene.setZoom(scene.zoom - ZOOM_STEP);
                                        editor.update();
                                    }}
                                />
                                {(editor.state.welcomeHintsVisible && !editor.state.tool && !isPresentation) && (
                                    <Hint
                                        position="bottom"
                                        title="Zoom"
                                        contentClassName="w-24 text-center"
                                        content="Apply zoom to the board."
                                    />
                                )}
                            </div>
                        )}
                        {props.headerRightContent}
                    </div>
                </React.Fragment>
            )}
            {editor.state.export.visible && (
                <ExportDialog
                    cropRegion={editor.state.export.cropRegion}
                    onClose={() => {
                        editor.state.export.visible = false;
                        editor.state.export.cropRegion = null;
                        editor.update();
                    }}
                />
            )}
        </div>
    );
};

// @description Public editor
export const Editor = ({initialData, ...props}) => {
    return (
        <SceneProvider initialData={initialData}>
            <EditorWithScene {...props} />
        </SceneProvider>
    );
};

Editor.defaultProps = {
    initialData: null,
    links: [],
    headerLeftContent: null,
    headerRightContent: null,
    onChange: null,
    onSave: null,
    onLoad: null,
    showExport: true,
    showLinks: true,
    showLoad: true,
    showSave: true,
    showMenu: true,
    showTitle: true,
    showResetBoard: true,
    showSettings: true,
    showChangeBackground: true,
    showScreenshot: true,
    showTools: true,
    showZoom: true,
    showHistory: true,
    showEdition: true,
    showHeader: true,
    // showFooter: false,
    showHints: true,
};
