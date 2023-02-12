import React from "react";
import {MenuIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";
import {DEFAULT_BACKGROUND} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {ConfirmProvider, useConfirm} from "../contexts/ConfirmContext.jsx";
import {ToastProvider, useToast} from "../contexts/ToastContext.jsx";
import {Layout, Renderer, Confirm, Toaster} from "../components/commons/index.jsx";
import {Menu} from "../components/View/Menu.jsx";

const BoardWrapper = props => {
    const board = useBoard();
    const {addToast} = useToast();
    const {showConfirm} = useConfirm();

    // Initialize board API
    if (props.folioRef && !props.folioRef.current) {
        props.folioRef.current = {
            addToast: addToast,
            showConfirm: showConfirm,
        };
    }

    // Main menu items
    const mainMenuItems = Object.values({
        loadFile: {
            icon: (<FolderIcon />),
            text: "Open...",
            onClick: props.onLoad,
        },
        saveFile: {
            icon: (<DownloadIcon />),
            text: "Save as...",
            onClick: props.onSave,
        },
        resetBoard: {
            icon: (<TrashIcon />),
            text: "Reset the board",
            onClick: props.onReset,
        },
    });

    // Export menu items
    const exportItems = Object.values({
        exportAsPng: {
            icon: (<ImageIcon />),
            text: "Export as PNG",
            onClick: () => props.onExport?.(EXPORT_FORMATS.PNG),
        },
        exportAsSvg: {
            icon: (<CodeIcon />),
            text: "Export as SVG",
            onClick: () => props.onExport?.(EXPORT_FORMATS.SVG),
        },
    })

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
                header={(
                    <div className="d:grid cols:2 w:full h:12">
                        <div className="d:flex gap:3">
                            <Menu
                                icon={(<MenuIcon />)}
                                items={mainMenuItems}
                            />
                        </div>
                        <div className="d:flex gap:3 justify:end">
                            <Menu
                                text="Export Image"
                                icon={(<ImageIcon />)}
                                items={exportItems}
                            />
                        </div>
                    </div>
                )}
                onChange={props.onChange}
            />
            <Confirm />
            <Toaster />
        </BoardProvider>
    );
};

export const Board = React.forwardRef((props, ref) => {
    const [_, onUpdate] = React.useReducer(x => x + 1, 0);
    const boardProps = {
        elements: props.elements,
        assets: props.assets,
        onChange: props.onChange,
        onUpdate: onUpdate,
    };

    return (
        <BoardProvider {...boardProps}>
            <ConfirmProvider>
                <ToastProvider>
                    <BoardWrapper {...props} folioRef={ref} />
                </ToastProvider>
            </ConfirmProvider>
        </BoardProvider>
    );
});

Board.defaultProps = {
    elements: [],
    assets: {},
    onChange: null,
    onExport: null,
    onSave: null,
    onLoad: null,
    onReset: null,
};
