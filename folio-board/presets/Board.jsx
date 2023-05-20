import React from "react";

import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {SecondaryButton} from "../components/commons/index.jsx";
import {Layout} from "../components/Layout.jsx";
import {Renderer} from "../components/Renderer.jsx";
import {ContextMenu} from "../components/ContextMenu.jsx";
import {Welcome} from "../components/Welcome.jsx";
import {Menu} from "../components/Menu.jsx";
import {ExportDialog} from "../components/ExportDialog.jsx";

const InnerBoard = props => {
    const {showConfirm} = useConfirm();
    const board = useBoard();
    const [welcomeVisible, setWelcomeVisible] = React.useState(props.showWelcome && (board.elements.length === 0));
    const [exportVisible, setExportVisible] = React.useState(false);

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
        <div className="position-relative overflow-hidden h-full w-full select-none">
            <Renderer onChange={props.onChange} />
            {board.state.contextMenuVisible && (
                <ContextMenu onChange={props.onChange} />
            )}
            <Layout
                showHeader={true}
                headerContent={(
                    <div className="d-flex gap-2">
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
                            onExport={() => {
                                if (board.elements.length > 0) {
                                    setExportVisible(true);
                                }
                            }}
                        />
                        {props.header}
                    </div>
                )}
                onChange={props.onChange}
            />
            {welcomeVisible && (
                <Welcome
                    version={process.env.VERSION}
                    onClose={() => setWelcomeVisible(false)}
                    onLoad={props.onLoad}
                />
            )}
            {exportVisible && (
                <ExportDialog
                    onClose={() => setExportVisible(false)}
                />
            )}
        </div>
    );
};

export const Board = props => (
    <ConfirmProvider>
        <BoardProvider
            initialData={props.initialData}
            render={() => ((
                <InnerBoard {...props} />
            ))}
        />
    </ConfirmProvider>
);

Board.defaultProps = {
    initialData: {},
    links: [],
    header: null,
    onChange: null,
    onSave: null,
    onLoad: null,
    onResetBoard: null,
    showWelcome: true,
    showExport: true,
    showLinks: true,
    showLoad: true,
    showSave: true,
    showResetBoard: true,
    showSettings: true,
    showChangeBackground: true,
};
