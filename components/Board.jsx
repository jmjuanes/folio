import React from "react";
import {ACTIONS} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {HeaderContainer, HeaderButton, HeaderSeparator} from "./HeaderCommons.jsx";
import {Layout} from "./Layout.jsx";
import {Renderer} from "./Renderer.jsx";
import {ContextMenu} from "./ContextMenu.jsx";
import {Menu} from "./Menu.jsx";
import {Title} from "./Title.jsx";
import {ExportDialog} from "./ExportDialog.jsx";

const InnerBoard = React.forwardRef((props, ref) => {
    const {showConfirm} = useConfirm();
    const board = useBoard();
    const [exportVisible, setExportVisible] = React.useState(false);
    const [screenshotRegion, setScreenshotRegion] = React.useState(null);
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
            <Layout
                showHeader={true}
                showTitle={true}
                headerLeftContent={(
                    <React.Fragment>
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
                    </React.Fragment>
                )}
                headerRightContent={(
                    <React.Fragment>
                        {props.headerRightContent}
                    </React.Fragment>
                )}
                onChange={props.onChange}
            />
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
};
