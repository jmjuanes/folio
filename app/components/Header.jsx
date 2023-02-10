import React from "react";
import {DrawingIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {DownloadIcon, ImageIcon, CodeIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";

import {Button} from "./Button.jsx";
import {Dropdown} from "./Dropdown.jsx";

export const Header = props => (
    <div className="d:grid cols:2 w:full h:12">
        <div className="d:flex gap:3">
            <div className="group d:flex position:relative" tabIndex="0">
                <div className="d:flex items:center bg:dark-900 bg:dark-600:hover r:xl cursor:pointer">
                    <div className="d:flex text:2xl text:white px:2">
                        <DrawingIcon />
                    </div>
                </div>
                <Dropdown
                    className="d:none d:block:group-focus-within top:full left:0"
                    items={{
                        loadFile: {
                            icon: (<FolderIcon />),
                            text: "Open...",
                            onClick: props.onLoadFile,
                        },
                        saveFile: {
                            icon: (<DownloadIcon />),
                            text: "Save as...",
                            onClick: props.onSaveFile,
                        },
                        discardChanges: {
                            icon: (<TrashIcon />),
                            text: "Reset the board",
                            onClick: props.onDiscard,
                        },
                    }}
                />
            </div>
        </div>
        <div className="d:flex gap:3 justify:end">
            <div className="group d:flex position:relative" tabIndex="0">
                <Button
                    text="Export Image"
                    icon={(<ImageIcon />)}
                />
                <Dropdown
                    className="d:none d:block:group-focus-within top:full right:0"
                    items={{
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
                    }}
                />
            </div>
        </div>
    </div>
);

Header.defaultProps = {
    onLoadfile: null,
    onSaveFile: null,
    onDiscard: null,
    onExport: null,
};
