import React from "react";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";
import {DEFAULT_BACKGROUND} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {ToastProvider, useToast} from "../contexts/ToastContext.jsx";
import {Layout, Renderer, Confirm, Toaster} from "../components/commons/index.jsx";
import {Menu, MenuItem} from "../components/View/Menu.jsx";

const BoardWrapper = props => {
    const board = useBoard();
    const {addToast} = useToast();
    const {showConfirm} = useConfirm();

    // Initialize board API
    if (props.folioRef && !props.folioRef.current) {
        props.folioRef.current = {
            forceUpdate: () => board.update(),
            // Board content
            getElements: () => board.elements,
            getAssets: () => board.assets,
            addAsset: data => board.addAsset(data),
            reset: () => board.reset(),
            // History API
            undo: () => board.undo(),
            redo: () => board.redo(),
            // Extra actions
            addToast: message => addToast(message),
            showConfirm: message => showConfirm(message),
        };
    }

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
                header={props.header}
                headerLeftContent={props.headerLeftContent || (
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
                )}
                headerRightContent={props.headerRightContent || (
                    <div className="d:flex gap:2">
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
                    </div>
                )}
                footer={props.footer}
                onChange={props.onChange}
            />
            <Confirm />
            <Toaster />
        </div>
    );
};

export const Board = React.forwardRef((props, ref) => (
    <BoardProvider
        elements={props.elements}
        assets={props.assets}
        onChange={props.onChange}
        render={() => ((
            <ConfirmProvider>
                <ToastProvider>
                    <BoardWrapper {...props} folioRef={ref} />
                </ToastProvider>
            </ConfirmProvider>
        ))}
    />
));

Board.defaultProps = {
    elements: [],
    assets: {},
    boardActions: {},
    header: true,
    headerLeftContent: null,
    headerRightContent: null,
    footer: false,
    onChange: null,
    onExport: null,
    onSave: null,
    onLoad: null,
    onReset: null,
};
