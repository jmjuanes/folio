import React from "react";
import {DrawingIcon, FolderIcon, FileDotsIcon, FilePlusIcon, DiskIcon} from "@mochicons/react";
import {DownloadIcon, ImageIcon, CodeIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";

import {Button} from "./Button.jsx";
import {Dropdown} from "./Dropdown.jsx";

export const Header = props => (
    <div className="d:grid cols:3 w:full h:12">
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
                        newDraft: {
                            icon: (<FileDotsIcon />),
                            text: "New Draft",
                            disabled: props.newDraftDisabled,
                            onClick: () => !props.newDraftDisabled && props.onNewDraft?.(),
                        },
                        newProject: {
                            icon: (<FilePlusIcon />),
                            text: "New Project",
                            disabled: props.newProjectDisabled,
                            onClick: () => !props.newProjectDisabled && props.onNewProject?.(),
                        },
                        loadProject: {
                            icon: (<FolderIcon />),
                            text: "Load Project",
                            onClick: props.onLoadProject,
                        },
                    }}
                />
            </div>
            {props.saveVisible && (
                <Button
                    className="bg:dark-700 bg:dark-900:hover text:white"
                    text="Save"
                    icon={(<DiskIcon />)}
                    disabled={props.saveDisabled}
                    onClick={() => !props.saveDisabled && props.onSave?.()}
                />
            )}
        </div>
        <div className="d:flex justify:center items:center">
            <input
                type="text"
                className="bg:transparent font:bold text:center outline:0 b:0 p:0 text:lg"
                defaultValue={props.title}
                onChange={event => {
                    props?.onTitleChange?.(event.target.value || "");
                }}
            />
        </div>
        <div className="d:flex gap:3 justify:end">
            {props.exportVisible && (
                <div className="group d:flex position:relative" tabIndex="0">
                    <Button
                        text="Export"
                        icon={(<DownloadIcon />)}
                        disabled={props.exportDisabled}
                    />
                    <Dropdown
                        className="d:none d:block:group-focus-within top:full right:0"
                        items={{
                            exportAsPng: {
                                icon: (<ImageIcon />),
                                text: "Export as PNG",
                                disabled: props.exportDisabled,
                                onClick: () => !props.exportDisabled && props.onExport(EXPORT_FORMATS.PNG),
                            },
                            exportAsSvg: {
                                icon: (<CodeIcon />),
                                text: "Export as SVG",
                                disabled: props.exportDisabled,
                                onClick: () => !props.exportDisabled && props.onExport(EXPORT_FORMATS.SVG),
                            },
                        }}
                    />
                </div>
            )}
        </div>
    </div>
);

Header.defaultProps = {
    newDraftDisabled: false,
    onNewDraft: null,
    newProjectDisabled: false,
    onNewProject: null,
    onLoadProject: null,
    title: "Untitled",
    onTitleChange: null,
    exportVisible: true,
    exportDisabled: false,
    onExport: null,
    saveVisible: true,
    onSave: null,
    discardVisible: true,
    discardDisabled: false,
    onDiscard: null,
};
