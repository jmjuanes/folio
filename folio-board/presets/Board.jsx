import React from "react";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon, CameraIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";
import {DEFAULT_BACKGROUND, ACTIONS} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {Layout, Renderer, Button} from "../components/commons/index.jsx";
import {Menu, MenuItem} from "../components/View/Menu.jsx";

const BoardWrapper = props => {
    const board = useBoard();

    return (
        <div className="position:relative overflow:hidden h:full w:full">
            <Renderer
                grid={true}
                background={DEFAULT_BACKGROUND}
                onChange={props.onChange}
                onScreenshot={props.onScreenshot}
            />
            <Layout
                grid={props.grid}
                background={props.background}
                header={true}
                headerLeftContent={(
                    <div className="d:flex gap:2">
                        <Menu icon={(<BarsIcon />)}>
                            {props.boardActions?.load !== false && (
                                <MenuItem
                                    icon={(<FolderIcon />)}
                                    text="Open..."
                                    onClick={props.onLoad}
                                />
                            )}
                            {props.boardActions?.save !== false && (
                                <MenuItem
                                    icon={(<DownloadIcon />)}
                                    text="Save as..."
                                    onClick={props.onSave}
                                />
                            )}
                            {props.boardActions?.reset !== false && (
                                <MenuItem
                                    icon={(<TrashIcon />)}
                                    text="Reset the board"
                                    onClick={props.onReset}
                                />
                            )}
                        </Menu>
                        {props.customHeaderLeftContent}
                    </div>
                )}
                headerRightContent={(
                    <div className="d:flex gap:2">
                        {props.customHeaderRightContent}
                        {props.boardActions?.screenshot !== false && (
                            <Button
                                className="bg:white bg:light-300:hover b:1 b:light-900 b:solid"
                                icon={(<CameraIcon />)}
                                iconClassName="text:lg"
                                disabled={board.elements.length === 0}
                                onClick={() => {
                                    if (board.elements.length > 0) {
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.update();
                                    }
                                }}
                            />
                        )}
                        {(props.boardActions?.exportPng !== false || props.boardActions?.exportSvg !== false) && (
                            <Menu text="Export" icon={(<ImageIcon />)} align="right">
                                {props.boardActions?.exportPng !== false && (
                                    <MenuItem
                                        icon={(<ImageIcon />)}
                                        text="Export as PNG"
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.PNG)}
                                    />
                                )}
                                {props.boardActions?.exportSvg !== false && (
                                    <MenuItem
                                        icon={(<CodeIcon />)}
                                        text="Export as SVG"
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.SVG)}
                                    />
                                )}
                            </Menu>
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
