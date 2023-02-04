import React from "react";
import {
    DownloadIcon,
    ImageIcon,
    CodeIcon,
} from "@mochicons/react";
import {EXPORT_FORMATS} from "folio-core";

import {Button} from "./Button.jsx";
import {Dropdown} from "./Dropdown.jsx";
import {Logo} from "../commons/Logo.jsx";

export const Header = props => (
    <div className="d:grid cols:3 w:full">
        <div className="d:flex gap:2">
            <Logo />
        </div>
        <div className="d:flex justify:center items:center">
            <strong>{props.title}</strong>
        </div>
        <div className="d:flex gap:2 justify:end">
            {props.exportVisible && (
                <div className="group d:flex position:relative">
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
    title: "Untitled",
    onTitleChange: null,
    exportVisible: true,
    exportDisabled: false,
    onExport: null,
};
