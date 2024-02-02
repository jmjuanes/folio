import React from "react";
import {fileOpen} from "browser-fs-access";
import {useUpdate} from "react-use";
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
    ZOOM_DEFAULT,
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
import {blobToDataUrl} from "@lib/utils/blob.js";
import {getHandlers} from "@lib/handlers.js";
import {getBounds} from "@lib/bounds.js";
import {sceneActions} from "@lib/scene.js";
import {useScene} from "@hooks/use-scene.js";

export const Board = props => {
    const update = useUpdate();
    const [welcomeHintVisible, setWelcomeHintVisible] = React.useState(() => {
        return props.showWelcomeHint && (props?.initialData?.elements || []).length === 0;
    });
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);
    const [contextMenu, setContextMenu] = React.useState({x: 0, y: 0, visible: false});
    const scene = useScene(props.initialData);
    const selectedElements = sceneActions.getSelection(scene);

    // Initialize app state
    const {current as state} = React.useRef({
        current: STATES.IDLE,
        action: null,
        tool: null,
        lockTool: false,
        element: null,
        zoom: ZOOM_DEFAULT,
        translateX: 0,
        translateY: 0,
        grid: false,
        selection: null,
        erase: null,
        contextMenuVisible: false,
        contextMenuX: 0,
        contextMenuY: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        presentation: false,
    });

    const isScreenshot = state.action === ACTIONS.SCREENSHOT;
    const isPresentation = !!state.presentation;

    const events = useEvents(scene, state, update, {
        onChange: props.onChange,
        onScreenshot: props.onScreenshot,
    });
    const cursor = useCursor();
    const bounds = getBounds(selectedElements, );
    const handlers = getHandlers(selectedElements, );

    // Handle context menu
    const handleContextMenu = React.useCallback(event => {
        if ((!state.action || state.action === ACTIONS.SELECT || state.action === ACTIONS.TRANSLATE) && !state.tool) {
            // board.currentState = STATES.IDLE;
            // board.activeAction = null;
            return setContextMenu({
                visible: true,
                ...event,
            });
        }
    }, [state.action, state.tool]);

    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (scene.elements.length > 0 && welcomeHintVisible) {
            setWelcomeHintVisible(false);
        }
    }, [scene.elements.length]);

    // Handle board reset
    // const handleResetBoard = () => {
    //     return showConfirm({
    //         title: "Clear board",
    //         message: "This will clear the whole board. Do you want to continue?",
    //         callback: () => {
    //             board.clear();
    //             props?.onChange?.({
    //                 elements: board.elements,
    //                 assets: board.assets,
    //             });
    //         },
    //     });
    // };
    // Handle image load
    // const handleImageLoad = () => {
    //     const options = {
    //         description: "Folio Board",
    //         extensions: [
    //             FILE_EXTENSIONS.PNG,
    //             FILE_EXTENSIONS.JPG,
    //         ],
    //         multiple: false,
    //     };
    //     fileOpen(options)
    //         .then(blob => blobToDataUrl(blob))
    //         .then(data => board.addImage(data))
    //         .then(() => {
    //             props.onChange?.({
    //                 elements: board.elements,
    //                 assets: board.assets,
    //             });
    //         })
    //         .catch(error => console.error(error));
    // };

    return (
        <div className="relative overflow-hidden h-full w-full select-none">
            <Renderer
                onChange={props.onChange}
                onScreenshot={region => {
                    setScreenshotRegion(region);
                    setExportVisible(true);
                }}
            />
            <Canvas
                id={scene.id}
                elements={scene.data.elements}
                assets={scene.data.assets}
                backgroundColor={scene.data.background}
                cursor={cursor}
                translateX={state.translateX}
                translateY={state.translateY}
                zoom={state.zoom}
                bounds={bounds}
                boundsFillColor={SELECT_BOUNDS_FILL_COLOR}
                boundsStrokeColor={SELECT_BOUNDS_STROKE_COLOR}
                showBounds={!!bounds}
                handlers={handlers}
                brush={state.selection}
                brushFillColor={SELECTION_FILL_COLOR}
                brushStrokeColor={SELECTION_STROKE_COLOR}
                showBrush={state.action === ACTIONS.SELECT || state.action === ACTIONS.SCREENSHOT}
                pointer={state.erase}
                showPointer={state.action === ACTIONS.ERASE}
                showGrid={state.grid}
                {...events}
                onContextMenu={handleContextMenu}
            />

            {state.action === ACTIONS.POINTER && (
                <Pointer />
            )}
            {(contextMenu.visible && !isPresentation) &&  (
                <ContextMenu
                    onChange={props.onChange}
                />
            )}
            {props.showTools && !isScreenshot && !isPresentation && (
                <div className="absolute z-5 left-half bottom-0 mb-4" style={{transform:"translateX(-50%)"}}>
                    <ToolsPanel
                        showSelect={!isPresentation}
                        showTools={!isPresentation}
                        showLock={!isPresentation}
                        onPointerClick={() => {
                            board.setTool(null);
                            board.setAction(ACTIONS.POINTER);
                            board.update();
                        }}
                        onMoveClick={() => {
                            board.setTool(null);
                            board.setAction(ACTIONS.MOVE);
                            board.update();
                        }}
                        onEraseClick={() => {
                            board.setTool(null);
                            board.setAction(ACTIONS.ERASE);
                            board.update();
                        }}
                        onSelectionClick={() => {
                            board.setTool(null);
                            board.update();
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return handleImageLoad();
                            }
                            board.setTool(tool);
                            board.update();
                        }}
                        onLockToolClick={() => {
                            board.lockTool = !board.lockTool;
                            board.update();
                        }}
                    />
                    {(welcomeHintVisible && !state.tool && !isPresentation) && (
                        <Hint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {props.showEdition && state.current === STATES.IDLE && selectedElements.length > 0 && (
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
                                    />
                                )}
                                {props.showMenu && (props.showTitle || props.showScreenshot) && (
                                    <div className="w-px bg-neutral-200" />
                                )}
                                {props.showTitle && (
                                    <Title
                                        editable={!isPresentation}
                                        onChange={props.onChange}
                                    />
                                )}
                                {props.showScreenshot && !isPresentation && (
                                    <HeaderButton
                                        icon="camera"
                                        disabled={board.elements.length === 0}
                                        onClick={() => {
                                            board.setTool(null);
                                            board.setAction(ACTIONS.SCREENSHOT);
                                            board.update();
                                        }}
                                    />
                                )}
                            </HeaderContainer>
                            {(welcomeHintVisible && !state.tool && !isPresentation) && (
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
                                    onUndoClick={() => {
                                        board.undo();
                                        props.onChange?.({
                                            elements: board.elements,
                                        });
                                    }}
                                    onRedoClick={() => {
                                        board.redo();
                                        props.onChange?.({
                                            elements: board.elements,
                                        });
                                    }}
                                />
                                {(welcomeHintVisible && !state.tool) && (
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
                                    onZoomInClick={() => board.zoomIn()}
                                    onZoomOutClick={() => board.zoomOut()}
                                />
                                {(welcomeHintVisible && !state.tool && !isPresentation) && (
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

Board.defaultProps = {
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
