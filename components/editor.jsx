import React from "react";
import {BarsIcon, CameraIcon} from "@josemi-icons/react";
import {
    ACTIONS,
    ELEMENTS,
    SELECT_BOUNDS_FILL_COLOR,
    SELECT_BOUNDS_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    STATES,
} from "@lib/constants.js";
import {HeaderContainer, HeaderButton} from "@components/commons/header.jsx";
import {Canvas} from "@components/canvas.jsx";
// import {Pointer} from "@components/render/pointer.jsx";
import {ContextMenu} from "@components/ui/context-menu.jsx";
import {Menu} from "@components/ui/menu.jsx";
import {Title} from "@components/ui/title.jsx";
import {Hint} from "@components/ui/hint.jsx";
import {Zooming} from "@components/ui/zooming.jsx";
import {History} from "@components/ui/history.jsx";
import {ExportDialog} from "@components/dialogs/export.jsx";
import {ToolsPanel} from "@components/panels/tools.jsx";
import {EditionPanel} from "@components/panels/edition.jsx";
import {useConfirm} from "@contexts/confirm.jsx";
import {blobToDataUrl} from "@lib/utils/blob.js";
import {useHandlers} from "@hooks/use-handlers.js";
import {useBounds} from "@hooks/use-bounds.js";
import {sceneActions} from "@lib/scene.js";
import {useScene} from "@hooks/use-scene.js";
import {useEvents} from "@hooks/use-events.js";
import {useCursor} from "@hooks/use-cursor.js";
import {useEditor} from "@hooks/use-editor.js";

export const Editor = props => {
    const {showConfirm} = useConfirm();
    const [welcomeHintVisible, setWelcomeHintVisible] = React.useState(() => {
        return props.showWelcomeHint && (props?.initialData?.elements || []).length === 0;
    });
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);
    // const [contextMenuVisible, toggleContextMenu] = useToggle(false);
    const contextMenuPosition = React.useRef({});

    const scene = useScene(props.initialData);
    const editor = useEditor(scene);

    const selectedElements = sceneActions.getSelection(scene);
    const isScreenshot = editor.state.action === ACTIONS.SCREENSHOT;
    const isPresentation = !!editor.state.presentation;

    const events = useEvents(scene, editor, {
        onChange: props.onChange,
        onScreenshot: region => {
            setScreenshotRegion(region);
            setExportVisible(true);
        },
    });
    const cursor = useCursor(editor);
    const bounds = useBounds(editor, selectedElements);
    const handlers = useHandlers(editor, selectedElements);

    // Handle context menu
    const handleContextMenu = React.useCallback(event => {
        const {action, tool} = editor.state;
        if ((!action || action === ACTIONS.SELECT || action === ACTIONS.TRANSLATE) && !tool) {
            editor.state.current = STATES.IDLE;
            editor.state.action = null;
            // Display context menu
            editor.state.contextMenu = true;
            contextMenuPosition.current.x = event.x;
            contextMenuPosition.current.y = event.y;
            editor.update();
        }
    }, [editor.state.action, editor.state.tool]);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (welcomeHintVisible && scene && scene?.elements?.length > 0) {
            setWelcomeHintVisible(false);
        }
    }, [scene?.elements?.length]);

    // Effect to hide the context menu
    // React.useEffect(() => {
    //     if (contextMenuVisible) {
    //         toggleContextMenu(true);
    //     }
    // }, [editorState.action, editorState.tool]);

    // Handle board reset
    const handleResetBoard = () => {
        return showConfirm({
            title: "Clear board",
            message: "This will clear the whole board. Do you want to continue?",
            callback: () => {
                board.clear();
                props?.onChange?.({
                    elements: board.elements,
                    assets: board.assets,
                });
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
            .then(data => board.addImage(data))
            .then(() => {
                props.onChange?.({
                    elements: board.elements,
                    assets: board.assets,
                });
            })
            .catch(error => console.error(error));
    };

    return (
        <div className="relative overflow-hidden h-full w-full select-none">
            <Canvas
                id={scene.id}
                elements={scene.elements}
                assets={scene.assets}
                backgroundColor={scene.background}
                cursor={cursor}
                translateX={scene.state.translateX}
                translateY={scene.state.translateY}
                zoom={scene.state.zoom}
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
                showGrid={editor.state.grid}
                {...events}
                onContextMenu={handleContextMenu}
            />
            {(editor.state.contextMenu && !isPresentation) &&  (
                <ContextMenu
                    x={contextMenuPosition.current.x}
                    y={contextMenuPosition.current.y}
                    selectedElements={selectedElements}
                    canvasWidth={scene.width}
                    canvasHeight={scene.height}
                    onDuplicate={() => {
                        editor.actions.duplicate();
                        props?.onChange?.({
                            elements: scene.elements,
                        });
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                    onLock={() => {
                        sceneActions.lockElements(scene, selectedElements);
                        props?.onChange?.({
                            elements: scene.elements,
                        });
                        editor.update();
                    }}
                    onUnlock={() => {
                        sceneActions.unlockElements(scene, selectedElements);
                        props?.onChange?.({
                            elements: scene.elements,
                        });
                        editor.update();
                    }}
                    onCut={() => {
                        editor.actions.cut().then(() => {
                            props.onChange?.({
                                elements: scene.elements,
                            });
                            editor.state.contextMenu = false;
                            editor.update();
                        });
                    }}
                    onCopy={() => {
                        editor.actions.copy().then(() => {
                            editor.state.contextMenu = false;
                            editor.update();
                        });
                    }}
                    onPaste={() => {
                        editor.actions.paste(null, {x, y}).then(() => {
                            props.onChange?.({
                                elements: scene.elements,
                                assets: scene.assets,
                            });
                            editor.state.contextMenu = false;
                            editor.update();
                        });
                    }}
                    onSendBackward={() => {
                        sceneActions.sendElementsBackward(scene, selectedElements);
                        props?.onChange?.({
                            elements: scene.elements,
                        });
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                    onBringForward={() => {
                        sceneActions.bringElementsForward(scene, selectedElements);
                        props?.onChange?.({
                            elements: scene.elements,
                        });
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                    onSelectAll={() => {
                        editor.actions.selectAll();
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                    onDelete={() => {
                        sceneActions.removeElements(scene, selectedElements);
                        props.onChange?.({
                            elements: scene.elements,
                        });
                        editor.state.contextMenu = false;
                        editor.update();
                    }}
                />
            )}
            {props.showTools && !isScreenshot && !isPresentation && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
                        scene={scene}
                        editor={editor}
                        showSelect={!isPresentation}
                        showTools={!isPresentation}
                        showLock={!isPresentation}
                        onPointerClick={() => {
                            // board.setTool(null);
                            // board.setAction(ACTIONS.POINTER);
                            // board.update();
                        }}
                        onMoveClick={() => {
                            editor.actions.setTool(null);
                            editor.actions.setAction(ACTIONS.MOVE);
                            editor.update();
                        }}
                        onEraseClick={() => {
                            editor.actions.setTool(null);
                            editor.actions.setAction(ACTIONS.ERASE);
                            editor.update();
                        }}
                        onSelectionClick={() => {
                            editor.actions.setTool(null);
                            editor.update();
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return handleImageLoad();
                            }
                            editor.actions.setTool(tool);
                            editor.update();
                        }}
                        onToolLockClick={() => {
                            editor.state.toolLock = !editor.state.toolLock;
                            update();
                        }}
                    />
                    {(welcomeHintVisible && !editor.state.tool && !isPresentation) && (
                        <Hint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {props.showEdition && editor.state.current === STATES.IDLE && selectedElements.length > 0 && (
                <React.Fragment>
                    {(selectedElements.length > 1 || !selectedElements[0].editing) && (
                        <div className="absolute z-6 top-0 mt-16 right-0 pt-1 pr-6">
                            <EditionPanel
                                key={selectedElements.map(el => el.id).join("-")}
                                selectedElements={selectedElements}
                                scene={scene}
                                editor={editor}
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
                                        scene={scene}
                                        editor={editor}
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
                                            props?.onChange?.({
                                                background: scene.background,
                                            });
                                            editor.update();
                                        }}
                                        onGridToggle={() => {
                                            editor.state.grid = !editor.state.grid;
                                            editor.update();
                                        }}
                                        onPresentationToggle={() => {
                                            editor.state.presentation = !editor.state.presentation;
                                            editor.actions.setTool(null);
                                            editor.actions.setAction(ACTIONS.MOVE);
                                            editor.update();
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
                                            props.onChange?.({
                                                title: newTitle,
                                            });
                                        }}
                                    />
                                )}
                                {props.showScreenshot && !isPresentation && (
                                    <HeaderButton
                                        icon="camera"
                                        disabled={scene.elements.length === 0}
                                        onClick={() => {
                                            editor.actions.setTool(null);
                                            editor.actions.setAction(ACTIONS.SCREENSHOT);
                                            editor.update();
                                        }}
                                    />
                                )}
                            </HeaderContainer>
                            {(welcomeHintVisible && !editor.state.tool && !isPresentation) && (
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
                                <History
                                    undoDisabled={sceneActions.isUndoDisabled(scene)}
                                    redoDisabled={sceneActions.isRedoDisabled(scene)}
                                    onUndoClick={() => {
                                        sceneActions.undo(scene);
                                        props.onChange?.({
                                            elements: scene.elements,
                                        });
                                        editor.update();
                                    }}
                                    onRedoClick={() => {
                                        sceneActions.redo(scene);
                                        props.onChange?.({
                                            elements: scene.elements,
                                        });
                                        editor.update();
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
                                <Zooming
                                    zoom={scene.state.zoom}
                                    onZoomInClick={() => {
                                        sceneActions.zoomIn(scene);
                                        editor.state.contextMenu = false;
                                        editor.update();
                                    }}
                                    onZoomOutClick={() => {
                                        sceneActions.zoomOut(scene);
                                        editor.state.contextMenu = false;
                                        editor.update();
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
