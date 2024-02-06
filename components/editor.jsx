import React from "react";
import {useUpdate} from "react-use";
import {BarsIcon, CameraIcon} from "@josemi-icons/react";
import {
    ACTIONS,
    ELEMENTS,
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
import {isInputTarget} from "@lib/utils/events.js";
import {getRectangleBounds} from "@lib/utils/math.js";
import {useHandlers} from "@hooks/use-handlers.js";
import {useBounds} from "@hooks/use-bounds.js";
import {useCursor} from "@hooks/use-cursor.js";
import {useEvents} from "@hooks/use-events.js";
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
import {SceneProvider, useScene} from "@contexts/scene.js";
import {EditorProvider, useEditor} from "@contexts/editor.jsx";

// @private
const EditorWithScene = props => {
    const update = useUpdate();
    const scene = useScene();
    const [editorState, dispatchEditorChange] = useEditor();
    const {showConfirm} = useConfirm();

    const [welcomeHintVisible, setWelcomeHintVisible] = React.useState(() => {
        return props.showWelcomeHint && scene?.elements?.length === 0;
    });
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);

    const selectedElements = scene.getSelection();
    const isScreenshot = editorState.action === ACTIONS.SCREENSHOT;
    const isPresentation = !!editorState.presentation;

    const events = useEvents();
    // {
    //     onChange: props.onChange,
    //     onScreenshot: region => {
    //         setScreenshotRegion(region);
    //         setExportVisible(true);
    //     },
    // });
    const cursor = useCursor();
    const bounds = useBounds();
    const handlers = useHandlers();

    // Handle board reset
    const handleResetBoard = () => {
        return showConfirm({
            title: "Clear board",
            message: "This will clear the whole board. Do you want to continue?",
            callback: () => {
                // board.clear();
                // props?.onChange?.({
                //     elements: board.elements,
                //     assets: board.assets,
                // });
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
        // fileOpen(options)
        //     .then(blob => blobToDataUrl(blob))
        //     .then(data => board.addImage(data))
        //     .then(() => {
        //         props.onChange?.({
        //             elements: board.elements,
        //             assets: board.assets,
        //         });
        //     })
        //     .catch(error => console.error(error));
    };

    // Handle tool or action change
    const handleToolOrActionChange = React.useCallback((newTool, newAction) => {
        editorState.tool = newTool;
        editorState.action = newAction;
        scene.getElements().forEach(element => {
            element.selected = false;
            element.editing = false;
        });
        update();
    }, []);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (welcomeHintVisible && scene?.elements?.length > 0) {
            setWelcomeHintVisible(false);
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
                brush={editorState.selection}
                brushFillColor={SELECTION_FILL_COLOR}
                brushStrokeColor={SELECTION_STROKE_COLOR}
                showBrush={editorState.action === ACTIONS.SELECT || editorState.action === ACTIONS.SCREENSHOT}
                showPointer={editorState.action === ACTIONS.ERASE}
                showGrid={editorState.settings.grid}
                {...events}
            />
            {(editorState.contextMenu.visible && !isPresentation) &&  (
                <ContextMenu
                    onDuplicate={() => {
                        const elements = scene.getSelection();
                        const bounds = getRectangleBounds(elements);
                        scene.importElements(elements, (bounds.x2 + PASTE_OFFSET) - bounds.x1, 0);
                        editorState.contextMenu.visible = false;
                        dispatchEditorChange();
                        update();
                    }}
                    onLock={() => {
                        scene.lockElements(scene.getSelection());
                        dispatchEditorChange();
                        update();
                    }}
                    onUnlock={() => {
                        scene.unlockElements(scene.getSelection());
                        dispatchEditorChange();
                        update();
                    }}
                    onCut={handleCutToClipboard}
                    onCopy={handleCopyToClipboard}
                    onPaste={() => {
                        scene.paste(null).then(() => {
                            editorState.contextMenu.visible = false;
                            dispatchEditorChange();
                            update();
                        });
                    }}
                    onSendBackward={() => {
                        scene.sendElementsBackward(scene.getSelection());
                        dispatchEditorChange();
                        update();
                    }}
                    onBringForward={() => {
                        scene.bringElementsForward(scene.getSelection());
                        dispatchEditorChange();
                        update();
                    }}
                    onSelectAll={() => {
                        scene.getElements().forEach(el => el.selected = true);
                        update();
                    }}
                    onDelete={() => {
                        scene.removeElements(scene.getSelection());
                        dispatchEditorChange();
                        update();
                    }}
                />
            )}
            {props.showTools && !isScreenshot && !isPresentation && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
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
                            editorState.toolLocked = !editorState.toolLocked;
                            update();
                        }}
                    />
                    {(welcomeHintVisible && !editorState.tool && !isPresentation) && (
                        <Hint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {props.showEdition && editorState.current === STATES.IDLE && selectedElements.length > 0 && (
                <React.Fragment>
                    {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                        <div className="absolute z-6 top-0 mt-16 right-0 pt-1 pr-6">
                            <EditionPanel
                                key={selectedElements.map(el => el.id).join("-")}
                                onChange={props.onChange}
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
                                            dispatchEditorChange();
                                            update();
                                        }}
                                        onGridToggle={() => {
                                            editorState.settings.grid = !editorState.settings.grid;
                                            update();
                                        }}
                                        onPresentationToggle={() => {
                                            editorState.settings.presentationMode = !editorState.settings.presentationMode;
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
                                            dispatchEditorChange();
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
                            {(welcomeHintVisible && !editorState.tool && !isPresentation) && (
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
                                        dispatchEditorChange();
                                        update();
                                    }}
                                    onRedoClick={() => {
                                        scene.redo();
                                        dispatchEditorChange();
                                        update();
                                    }}
                                />
                                {(welcomeHintVisible && !editor.state.tool) && (
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
                                        update();
                                    }}
                                    onZoomOutClick={() => {
                                        scene.setZoom(scene.zoom - ZOOM_STEP);
                                        update();
                                    }}
                                />
                                {(welcomeHintVisible && !editor.state.tool && !isPresentation) && (
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
            {exportVisible && (
                <ExportDialog
                    cropRegion={screenshotRegion}
                    onClose={() => {
                        setExportVisible(false);
                        setScreenshotRegion(null);
                    }}
                />
            )}
        </div>
    );
};

// @description Public editor
export const Editor = ({initialData, onChange, ...props}) => {
    return (
        <SceneProvider initialData={initialData}>
            <EditorProvider onChange={onChange}>
                <EditorWithScene {...props} />
            </EditorProvider>
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
    showWelcomeHint: true,
};
