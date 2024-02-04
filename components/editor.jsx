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
import {History} from "@components/ui/history.jsx";
import {ExportDialog} from "@components/dialogs/export.jsx";
import {ToolsPanel} from "@components/panels/tools.jsx";
import {EditionPanel} from "@components/panels/edition.jsx";
import {ZoomPanel} from "@components/panels/zoom.jsx";
import {useConfirm} from "@contexts/confirm.jsx";
import {blobToDataUrl} from "@lib/utils/blob.js";
import {useHandlers} from "@hooks/use-handlers.js";
import {useBounds} from "@hooks/use-bounds.js";
import {sceneActions} from "@lib/scene.js";
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
    const editor = useEditor(props.initialData);

    const selectedElements = sceneActions.getSelection(editor.scene);
    const isScreenshot = editor.state.action === ACTIONS.SCREENSHOT;
    const isPresentation = !!editor.state.presentation;

    const events = useEvents(editor, {
        onChange: props.onChange,
        onScreenshot: region => {
            setScreenshotRegion(region);
            setExportVisible(true);
        },
    });
    const cursor = useCursor(editor);
    const bounds = useBounds(editor, selectedElements);
    const handlers = useHandlers(editor, selectedElements);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (welcomeHintVisible && editor?.scene?.elements?.length > 0) {
            setWelcomeHintVisible(false);
        }
    }, [editor.scene?.elements?.length]);

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

    return (
        <div className="relative overflow-hidden h-full w-full select-none">
            <Canvas
                id={editor.scene.id}
                elements={editor.scene.elements}
                assets={editor.scene.assets}
                backgroundColor={editor.scene.background}
                cursor={cursor}
                translateX={editor.scene.translateX}
                translateY={editor.scene.translateY}
                zoom={editor.scene.zoom}
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
            />
            {(editor.state.contextMenu && !isPresentation) &&  (
                <ContextMenu
                    left={editor.state.contextMenuLeft}
                    top={editor.state.contextMenuTop}
                    selectedElements={selectedElements}
                    canvasWidth={editor.scene.width}
                    canvasHeight={editor.scene.height}
                    onDuplicate={editor.duplicate}
                    onLock={editor.lockElements}
                    onUnlock={editor.unlockElements}
                    onCut={editor.cut}
                    onCopy={editor.copy}
                    onPaste={editor.paste}
                    onSendBackward={editor.sendBackward}
                    onBringForward={editor.bringForward}
                    onSelectAll={editor.selectAll}
                    onDelete={editor.remove}
                />
            )}
            {props.showTools && !isScreenshot && !isPresentation && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
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
                            editor.setTool(null);
                            editor.setAction(ACTIONS.MOVE);
                            editor.update();
                        }}
                        onEraseClick={() => {
                            editor.setTool(null);
                            editor.setAction(ACTIONS.ERASE);
                            editor.update();
                        }}
                        onSelectionClick={() => {
                            editor.setTool(null);
                            editor.update();
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return handleImageLoad();
                            }
                            editor.setTool(tool);
                            editor.update();
                        }}
                        onToolLockClick={() => {
                            editor.state.toolLocked = !editor.state.toolLocked;
                            editor.update();
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
                                            editor.scene.background = newBackground;
                                            props?.onChange?.({
                                                background: editor.scene.background,
                                            });
                                            editor.update();
                                        }}
                                        onGridToggle={() => {
                                            editor.state.grid = !editor.state.grid;
                                            editor.update();
                                        }}
                                        onPresentationToggle={() => {
                                            editor.state.presentation = !editor.state.presentation;
                                            editor.setTool(null);
                                            editor.setAction(ACTIONS.MOVE);
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
                                            editor.scene.title = newTitle;
                                            props.onChange?.({
                                                title: newTitle,
                                            });
                                        }}
                                    />
                                )}
                                {props.showScreenshot && !isPresentation && (
                                    <HeaderButton
                                        icon="camera"
                                        disabled={sceneActions.getElements(editor.scene).length === 0}
                                        onClick={() => {
                                            editor.setTool(null);
                                            editor.setAction(ACTIONS.SCREENSHOT);
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
                                    undoDisabled={sceneActions.isUndoDisabled(editor.scene)}
                                    redoDisabled={sceneActions.isRedoDisabled(editor.scene)}
                                    onUndoClick={editor.undo}
                                    onRedoClick={editor.redo}
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
                                    zoom={editor.scene.zoom}
                                    onZoomInClick={editor.zoomIn}
                                    onZoomOutClick={editor.zoomOut}
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
