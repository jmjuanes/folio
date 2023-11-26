import React from "react";
import {fileOpen} from "browser-fs-access";
import {BarsIcon, CameraIcon} from "@josemi-icons/react";
import {ELEMENTS, FILE_EXTENSIONS, ACTIONS, STATES} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {HeaderContainer, HeaderButton, HeaderSeparator} from "./HeaderCommons.jsx";
import {Renderer} from "./Renderer.jsx";
import {Pointer} from "./Pointer.jsx";
import {ContextMenu} from "./ContextMenu.jsx";
import {Menu} from "./Menu.jsx";
import {Title} from "./Title.jsx";
import {ExportDialog} from "./ExportDialog.jsx";
import {ToolsPanel} from "./ToolsPanel.jsx";
import {EditionPanel} from "./EditionPanel.jsx";
import {Zooming} from "./Zooming.jsx";
import {History} from "./History.jsx";
import {WelcomeHint} from "./WelcomeHint.jsx";
import {blobToDataUrl} from "../utils/blob.js";

const InnerBoard = React.forwardRef((props, ref) => {
    const {showConfirm} = useConfirm();
    const board = useBoard();
    const [welcomeHintVisible, setWelcomeHintVisible] = React.useState(() => {
        return props.showWelcomeHint && board.elements.length === 0;
    });
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);
    const selectedElements = board.getSelectedElements();
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;
    const isPresentation = !!board.state.presentationMode;
    // Effect to disable the visibility of the welcome elements
    React.useEffect(() => {
        if (board.elements.length > 0 && welcomeHintVisible) {
            setWelcomeHintVisible(false);
        }
    }, [board.elements.length]);
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
    // Handle load
    const handleLoad = () => {
        if (board.elements.length > 0) {
            return showConfirm({
                title: "Load new board",
                message: "Changes made in this board will be lost. Do you want to continue?",
                callback: () => props.onLoad?.(),
            });
        }
        // Just call the onLoad listener
        props.onLoad?.();
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
            <Renderer
                onChange={props.onChange}
                onScreenshot={region => {
                    setScreenshotRegion(region);
                    setExportVisible(true);
                }}
            />
            {board.activeAction === ACTIONS.POINTER && (
                <Pointer />
            )}
            {(board.state.contextMenuVisible && !isPresentation) &&  (
                <ContextMenu onChange={props.onChange} />
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
                    {(welcomeHintVisible && !board.activeTool && !isPresentation) && (
                        <WelcomeHint
                            position="top"
                            title="Tools Panel"
                            contentClassName="w-48 text-center"
                            content="All the available tools. Pick one and start drawing!"
                        />
                    )}
                </div>
            )}
            {props.showEdition && board.currentState === STATES.IDLE && selectedElements.length > 0 && (
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
                    <div className="absolute top-0 left-0 pt-4 pl-6 z-7 flex gap-3">
                        {props.showMenu && (
                            <div className="relative flex">
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
                                    onLoad={handleLoad}
                                    onResetBoard={handleResetBoard}
                                    onExport={() => setExportVisible(true)}
                                />
                            {(welcomeHintVisible && !board.activeTool && !isPresentation) && (
                                <WelcomeHint
                                    position="bottom"
                                    title="Menu"
                                    contentClassName="w-20"
                                    content="Export, save, configure."
                                />
                            )}
                            </div>
                        )}
                        {props.showScreenshot && !isPresentation && (
                            <HeaderContainer>
                                <HeaderButton
                                    icon="camera"
                                    disabled={board.elements.length === 0}
                                    onClick={() => {
                                        board.setTool(null);
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.update();
                                    }}
                                />
                            </HeaderContainer>
                        )}
                        {props.headerLeftContent}
                    </div>
                    {props.showTitle && (
                        <div className="absolute top-0 left-half pt-4 z-7 flex" style={{transform:"translateX(-50%)"}}>
                            <Title
                                editable={!isPresentation}
                                onChange={props.onChange}
                            />
                        </div>
                    )}
                    <div className="absolute top-0 right-0 pt-4 pr-6 z-7 flex gap-3">
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
                                {(welcomeHintVisible && !board.activeTool) && (
                                    <WelcomeHint
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
                                {(welcomeHintVisible && !board.activeTool && !isPresentation) && (
                                    <WelcomeHint
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
});

// Export board component
export const Board = React.forwardRef((props, ref) => (
    <BoardProvider
        initialData={props.initialData}
        onError={props.onError}
        render={() => (
            <ConfirmProvider>
                <InnerBoard ref={ref} {...props} />
            </ConfirmProvider>
        )}
    />
));

Board.defaultProps = {
    initialData: null,
    links: [],
    headerLeftContent: null,
    headerRightContent: null,
    onChange: null,
    onSave: null,
    onLoad: null,
    onError: null,
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
