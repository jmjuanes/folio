import React from "react";
import {fileOpen} from "browser-fs-access";
import {ELEMENTS, FILE_EXTENSIONS, ACTIONS, STATES} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {HeaderContainer, HeaderButton, HeaderSeparator} from "./HeaderCommons.jsx";
import {Renderer} from "./Renderer.jsx";
import {ContextMenu} from "./ContextMenu.jsx";
import {Menu} from "./Menu.jsx";
import {Title} from "./Title.jsx";
import {ExportDialog} from "./ExportDialog.jsx";
import {ToolsPanel} from "./ToolsPanel.jsx";
import {EditionPanel} from "./EditionPanel.jsx";
import {Zooming} from "./Zooming.jsx";
import {History} from "./History.jsx";
import {blobToDataUrl} from "../utils/blob.js";

const InnerBoard = React.forwardRef((props, ref) => {
    const {showConfirm} = useConfirm();
    const board = useBoard();
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);
    const selectedElements = board.getSelectedElements();
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;
    // Handle board reset
    const handleResetBoard = () => {
        return showConfirm({
            title: "Clear board",
            message: "This will clear the whole board. Do you want to continue?",
            callback: () => props.onResetBoard?.(),
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
            {board.state.contextMenuVisible && (
                <ContextMenu onChange={props.onChange} />
            )}
            {props.showTools && !isScreenshot && (
                <ToolsPanel
                    style={{
                        bottom: "1rem",
                        left: "50%",
                        transform: "translateX(-50%)",
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
            )}
            {props.showEdition && board.currentState === STATES.IDLE && selectedElements.length > 0 && (
                <EditionPanel
                    key={selectedElements.map(el => el.id).join("-")}
                    onChange={props.onChange}
                />
            )}
            {props.showHeader && !isScreenshot && (
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-7 flex gap-2">
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
                                    onLoad={handleLoad}
                                    onResetBoard={handleResetBoard}
                                    onExport={() => setExportVisible(true)}
                                />
                            )}
                            {props.showTitle && (
                                <React.Fragment>
                                    <HeaderSeparator />
                                    <Title onChange={props.onChange} />
                                </React.Fragment>
                            )}
                            {props.showScreenshot && (
                                <React.Fragment>
                                    <HeaderSeparator />
                                    <HeaderButton
                                        icon="camera"
                                        disabled={board.elements.length === 0}
                                        onClick={() => {
                                            board.setTool(null);
                                            board.setAction(ACTIONS.SCREENSHOT);
                                            board.update();
                                        }}
                                    />
                                </React.Fragment>
                            )}
                        </HeaderContainer>
                        {props.headerLeftContent}
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-7 flex gap-2">
                        {props.showHistory && (
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
                        )}
                        {props.showZoom && (
                            <Zooming
                                onZoomInClick={() => board.zoomIn()}
                                onZoomOutClick={() => board.zoomOut()}
                            />
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
    onResetBoard: null,
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
};
