import React from "react";
import {GridIcon, FolderIcon, PlusIcon} from "@mochicons/react";
import {DownloadIcon, ImageIcon, CodeIcon} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";

import {Button} from "./Button.jsx";
import {Dropdown} from "./Dropdown.jsx";
import {Logo} from "../commons/Logo.jsx";

export const Header = props => (
    <div className="d:grid cols:3 w:full">
        <div className="d:flex gap:3">
            <div className="d:flex">
                <Logo />
            </div>
            {props.projectsVisible && (
                <div className="group d:flex position:relative" tabIndex="0">
                    <Button
                        text="Projects"
                        icon={(<GridIcon />)}
                    />
                    <Dropdown
                        className="d:none d:block:group-focus-within top:full left:0"
                        items={{
                            createProject: {
                                icon: (<PlusIcon />),
                                text: "Create Project",
                                onClick: props.onCreateProject,
                            },
                            loadProject: {
                                icon: (<FolderIcon />),
                                text: "Load Project",
                                onClick: props.onLoadProject,
                            },
                        }}
                    />
                </div>
            )}
        </div>
        <div className="d:flex justify:center items:center">
            <input
                type="text"
                className="bg:transparent b:none font:bold text:center outline:transparent p:0"
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
                    />
                    <Dropdown
                        className="d:none d:block:group-focus-within top:full right:0"
                        items={{
                            exportAsPng: {
                                icon: (<ImageIcon />),
                                text: "Export as PNG",
                                onClick: () => props.onExport(EXPORT_FORMATS.PNG),
                            },
                            exportAsSvg: {
                                icon: (<CodeIcon />),
                                text: "Export as SVG",
                                onClick: () => props.onExport(EXPORT_FORMATS.SVG),
                            },
                        }}
                    />
                </div>
            )}
        </div>
    </div>
);

Header.defaultProps = {
    projectsVisible: true,
    onCreateProject: null,
    onLoadProject: null,
    title: "Untitled",
    onTitleChange: null,
    exportVisible: true,
    exportDisabled: false,
    onExport: null,
};
