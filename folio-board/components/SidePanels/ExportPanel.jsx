import React from "react";
import {SidePanel} from "./SidePanel.jsx";
import {Form} from "../Form/index.jsx";
import {ImageIcon} from "../icons/index.jsx";

const options = {
    filename: {
        type: "input",
        title: "File name",
        placeholder: "export.png",
    },
    background: {
        type: "checkbox",
        title: "Backgorund",
    },
    format: {
        type: "select",
        title: "Export format",
        values: [
            {value: "png", text: "PNG", icon: ImageIcon()},
            {value: "svg", text: "SVG", icon: ImageIcon()},
        ],
        grid: "2",
    },
};

export const ExportPanel = props => (
    <SidePanel title="Export" submitText="Export Image" onClose={props.onClose} onSubmit={props.onSubmit}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
    </SidePanel>
);

ExportPanel.defaultProps = {
    values: {},
    onChange: null,
    onSubmit: null,
    onClose: null,
};
