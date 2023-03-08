import React from "react";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon, CameraIcon} from "@mochicons/react";
import {ToolIcon, LockIcon, GridIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";
import {ACTIONS} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {Layout, Renderer, SecondaryButton} from "../components/commons/index.jsx";
import {Dropdown, DropdownSeparator, DropdownGroup, DropdownItem, DropdownCheckItem} from "../components/commons/index.jsx";
import {ColorPicker} from "../components/Form/ColorPicker.jsx";

const BoardWrapper = props => {
    const board = useBoard();

    return (
        <div className="position:relative overflow:hidden h:full w:full">
            <Renderer
                onChange={props.onChange}
                onScreenshot={props.onScreenshot}
            />
            <Layout
                grid={props.grid}
                background={props.background}
                header={true}
                headerLeftContent={(
                    <div className="d:flex gap:2">
                        <div className="d:flex position:relative group" tabIndex="0">
                            <SecondaryButton icon={(<BarsIcon />)} />
                            <Dropdown className="d:none d:block:group-focus-within top:full left:0">
                                {props.boardActions?.load !== false && (
                                    <DropdownItem
                                        icon={(<FolderIcon />)}
                                        text="Open..."
                                        onClick={props.onLoad}
                                    />
                                )}
                                {props.boardActions?.save !== false && (
                                    <DropdownItem
                                        icon={(<DownloadIcon />)}
                                        text="Save as..."
                                        onClick={props.onSave}
                                    />
                                )}
                                {props.boardActions?.reset !== false && (
                                    <DropdownItem
                                        icon={(<TrashIcon />)}
                                        text="Reset the board"
                                        onClick={props.onReset}
                                    />
                                )}
                            </Dropdown>
                        </div>
                        {props.customHeaderLeftContent}
                    </div>
                )}
                headerRightContent={(
                    <div className="d:flex gap:2">
                        {props.customHeaderRightContent}
                        {props.boardActions?.preferences !== false && (
                            <div className="d:flex position:relative group" tabIndex="0">
                                <SecondaryButton icon={(<ToolIcon />)} />
                                <Dropdown className="d:none d:block:group-focus-within top:full right:0">
                                    <DropdownGroup title="General settings" />
                                    <DropdownCheckItem
                                        active={board.grid}
                                        icon={(<GridIcon />)}
                                        text="Grid"
                                        onClick={() => {
                                            board.grid = !board.grid;
                                            board.update();
                                        }}
                                    />
                                    <DropdownCheckItem
                                        active={board.lockTool}
                                        icon={(<LockIcon />)}
                                        text="Lock tool"
                                        onClick={() => {
                                            board.lockTool = !board.lockTool;
                                            board.update();
                                        }}
                                    />
                                    <DropdownSeparator />
                                    <div className="d:block mt:2">
                                        <DropdownGroup title="Background" />
                                        <ColorPicker
                                            value={board.background}
                                            onChange={newBackground => {
                                                board.background = newBackground;
                                                board.update();
                                            }}
                                        />
                                    </div>
                                </Dropdown>
                            </div>
                        )}
                        {props.boardActions?.screenshot !== false && (
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
                        {(props.boardActions?.exportPng !== false || props.boardActions?.exportSvg !== false) && (
                            <div className="d:flex position:relative group" tabIndex="0">
                                <SecondaryButton
                                    icon={(<ImageIcon />)}
                                    text="Export"
                                    disabled={board.elements.length === 0}
                                />
                                <Dropdown className="d:none d:block:group-focus-within top:full right:0">
                                    {props.boardActions?.exportPng !== false && (
                                        <DropdownItem
                                            icon={(<ImageIcon />)}
                                            text="Export as PNG"
                                            disabled={board.elements.length === 0}
                                            onClick={() => props.onExport?.(EXPORT_FORMATS.PNG)}
                                        />
                                    )}
                                    {props.boardActions?.exportSvg !== false && (
                                        <DropdownItem
                                            icon={(<CodeIcon />)}
                                            text="Export as SVG"
                                            disabled={board.elements.length === 0}
                                            onClick={() => props.onExport?.(EXPORT_FORMATS.SVG)}
                                        />
                                    )}
                                </Dropdown>
                            </div>
                        )}
                    </div>
                )}
                footer={false}
                onChange={props.onChange}
            />
        </div>
    );
};

export const Board = props => (
    <BoardProvider
        initialState={props.initialState}
        render={() => ((
            <BoardWrapper {...props} />
        ))}
    />
);

Board.defaultProps = {
    initialtate: {},
    boardActions: {},
    customHeaderLeftContent: null,
    custonHeaderRightContent: null,
    onChange: null,
    onExport: null,
    onSave: null,
    onLoad: null,
    onReset: null,
    onScreenshot: null,
};
