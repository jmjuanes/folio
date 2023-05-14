import React from "react";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon, CameraIcon} from "@mochicons/react";
import {GridIcon} from "@mochicons/react";

import {EXPORT_FORMATS, BACKGROUND_COLORS} from "folio-core";

import {ACTIONS} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {SecondaryButton, ColorPicker} from "../components/commons/index.jsx";
import {Dropdown, DropdownSeparator, DropdownGroup} from "../components/commons/index.jsx";
import {DropdownItem, DropdownCheckItem, DropdownLinkItem} from "../components/commons/index.jsx";
import {ContextMenu, ContextMenuItem, ContextMenuSeparator} from "../components/commons/index.jsx";
import {Layout} from "../components/Layout.jsx";
import {Renderer} from "../components/Renderer.jsx";
import {Welcome} from "../components/Welcome.jsx";
import {isGroupVisible, isUngroupVisible} from "../board.js";

const InnerBoard = props => {
    const board = useBoard();
    const [welcomeVisible, setWelcomeVisible] = React.useState(props.showWelcome && (board.elements.length === 0));
    const selectedElements = board.state.contextMenuVisible ? board.getSelectedElements() : [];

    return (
        <div className="position-relative overflow-hidden h-full w-full select-none">
            <Renderer onChange={props.onChange} />
            {board.state.contextMenuVisible && (
                <ContextMenu x={board.state.contextMenuX} y={board.state.contextMenuY}>
                    {selectedElements.length > 0 && (
                        <React.Fragment>
                            <ContextMenuItem
                                text="Duplicate"
                                onClick={() => {
                                    board.state.contextMenuVisible = false;
                                    board.duplicate();
                                    props.onChange?.(board.export());
                                    board.update();
                                }}
                            />
                            {isGroupVisible(board) && (
                                <ContextMenuItem
                                    text="Group"
                                    onClick={() => {
                                        board.state.contextMenuVisible = false;
                                        board.group();
                                        props.onChange?.(board.export);
                                        board.update();
                                    }}
                                />
                            )}
                            {isUngroupVisible(board) && (
                                <ContextMenuItem
                                    text="Ungroup"
                                    onClick={() => {
                                        board.state.contextMenuVisible = false;
                                        board.ungroup();
                                        props.onChange?.(board.export);
                                        board.update();
                                    }}
                                />
                            )}
                            <ContextMenuSeparator />
                        </React.Fragment>
                    )} 
                    {selectedElements.length > 0 && (
                        <React.Fragment>
                            <ContextMenuItem
                                text="Cut"
                                onClick={() => {
                                    board.cut().then(() => {
                                        board.state.contextMenuVisible = false;
                                        props.onChange?.(board.export());
                                        board.update();
                                    });
                                }}
                            />
                            <ContextMenuItem
                                text="Copy"
                                onClick={() => {
                                    board.copy().then(() => {
                                        board.state.contextMenuVisible = false;
                                        board.update();
                                    });
                                }}
                            />
                        </React.Fragment>
                    )}
                    <ContextMenuItem
                        text="Paste"
                        onClick={() => {
                            const point = {
                                x: board.state.contextMenuX,
                                y: board.state.contextMenuY,
                            };
                            board.paste(null, point).then(() => {
                                props.onChange?.(board.export());
                                board.state.contextMenuVisible = false;
                                board.update();
                            });
                        }}
                    />
                    {board.elements.length > 0 && (
                        <React.Fragment>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                text="Select All"
                                onClick={() => {
                                    board.selectAll();
                                    board.state.contextMenuVisible = false;
                                    board.update();
                                }}
                            />
                        </React.Fragment>
                    )}
                    {selectedElements.length > 0 && (
                        <React.Fragment>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                text="Delete"
                                onClick={() => {
                                    board.state.contextMenuVisible = false;
                                    board.remove();
                                    props.onChange?.(board.export());
                                    board.update();
                                }}
                            />
                        </React.Fragment>
                    )} 
                </ContextMenu>
            )}
            <Layout
                header={true}
                headerLeftContent={(
                    <div className="d-flex gap-2">
                        <div className="d-flex position-relative group" tabIndex="0">
                            <SecondaryButton icon={(<BarsIcon />)} />
                            <Dropdown className="d-none d-block:group-focus-within top-full left-0">
                                <DropdownGroup title="Actions" />
                                {props.showLoadAction && (
                                    <DropdownItem
                                        icon={(<FolderIcon />)}
                                        text="Open..."
                                        onClick={props.onLoad}
                                    />
                                )}
                                {props.showOpenAction && (
                                    <DropdownItem
                                        icon={(<DownloadIcon />)}
                                        text="Save as..."
                                        onClick={props.onSave}
                                    />
                                )}
                                {props.showResetBoardAction && (
                                    <DropdownItem
                                        icon={(<TrashIcon />)}
                                        text="Reset the board"
                                        onClick={props.onReset}
                                    />
                                )}
                                {props.showBoardSettings && (
                                    <React.Fragment>
                                        <DropdownSeparator />
                                        <DropdownGroup title="Board Settings" />
                                        <DropdownCheckItem
                                            active={board.grid}
                                            icon={(<GridIcon />)}
                                            text="Show Grid"
                                            onClick={() => {
                                                board.grid = !board.grid;
                                                board.update();
                                                props.onChange?.({
                                                    grid: board.grid,
                                                });
                                            }}
                                        />
                                    </React.Fragment>
                                )}
                                {props.showChangeBackground && (
                                    <React.Fragment>
                                        <DropdownSeparator />
                                        <DropdownGroup title="Background" />
                                        <ColorPicker
                                            value={board.background}
                                            values={Object.values(BACKGROUND_COLORS)}
                                            onChange={newBackground => {
                                                board.background = newBackground;
                                                board.update();
                                                props.onChange?.({
                                                    background: board.background,
                                                });
                                            }}
                                        />
                                    </React.Fragment>
                                )}
                                {(props.showLinks && props.links?.length > 0) && (
                                    <React.Fragment>
                                        <DropdownSeparator />
                                        <DropdownGroup title="Links" />
                                        {props.links.map(link => (
                                            <DropdownLinkItem
                                                key={link.url}
                                                url={link.url}
                                                text={link.text}
                                            />
                                        ))}
                                    </React.Fragment>
                                )}
                            </Dropdown>
                        </div>
                        {props.customHeaderLeftContent}
                    </div>
                )}
                headerRightContent={(
                    <div className="d-flex gap-2">
                        {props.customHeaderRightContent}
                        {props.showScreenshot && (
                            <SecondaryButton
                                icon={(<CameraIcon />)}
                                disabled={board.elements.length === 0}
                                onClick={() => {
                                    if (board.elements.length > 0) {
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.clearSelectedElements();
                                        board.update();
                                    }
                                }}
                            />
                        )}
                        {props.showExport && (
                            <div className="d-flex position-relative group" tabIndex="0">
                                <SecondaryButton
                                    icon={(<ImageIcon />)}
                                    text="Export"
                                    disabled={board.elements.length === 0}
                                />
                                <Dropdown className="d-none d-block:group-focus-within top-full right-0">
                                    <DropdownItem
                                        icon={(<ImageIcon />)}
                                        text="Export as PNG"
                                        disabled={board.elements.length === 0}
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.PNG)}
                                    />
                                    <DropdownItem
                                        icon={(<CodeIcon />)}
                                        text="Export as SVG"
                                        disabled={board.elements.length === 0}
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.SVG)}
                                    />
                                </Dropdown>
                            </div>
                        )}
                    </div>
                )}
                footer={false}
                onChange={props.onChange}
            />
            {welcomeVisible && (
                <Welcome
                    version={process.env.VERSION}
                    onClose={() => setWelcomeVisible(false)}
                    onLoad={props.onLoad}
                />
            )}
        </div>
    );
};

export const Board = props => (
    <BoardProvider
        initialData={props.initialData}
        render={() => ((
            <InnerBoard {...props} />
        ))}
    />
);

Board.defaultProps = {
    initialData: {},
    links: [],
    customHeaderLeftContent: null,
    custonHeaderRightContent: null,
    onChange: null,
    onExport: null,
    onSave: null,
    onLoad: null,
    onReset: null,
    onScreenshot: null,
    showWelcome: true,
    showScreenshot: true,
    showExport: true,
    showLinks: true,
    showLoadAction: true,
    showOpenAction: true,
    showResetBoardAction: true,
    showBoardSettings: true,
    showChangeBackground: true,
};
