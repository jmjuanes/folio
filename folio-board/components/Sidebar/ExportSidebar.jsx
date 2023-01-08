import React from "react";
import {EXPORT_FORMATS} from "folio-core";
import {Sidebar, SidebarContent, SidebarTitle, SidebarSubmit} from "./Sidebar.jsx";
import {Form} from "../Form/index.jsx";
import {ImageIcon, CodeIcon} from "../icons/index.jsx";

const options = {
    filename: {
        type: "input",
        title: "File name",
        placeholder: "untitled",
    },
    background: {
        type: "checkbox",
        title: "Backgorund",
    },
    scale: {
        type: "select",
        title: "Scale",
        values: [
            {value: 1, text: "1x"},
            {value: 2, text: "2x"},
            {value: 3, text: "3x"},
        ],
        grid: "3",
    },
    format: {
        type: "select",
        title: "Export format",
        values: [
            {
                value: EXPORT_FORMATS.PNG,
                text: "PNG",
                icon: ImageIcon(),
                iconClass: "text:2xl pt:2",
            },
            {
                value: EXPORT_FORMATS.SVG,
                text: "SVG",
                icon: CodeIcon(),
                iconClass: "text:2xl pt:2",
            },
        ],
        grid: "2",
    },
};

export const ExportSidebar = props => (
    <Sidebar>
        <SidebarTitle title="Export" onClose={props.onClose} />
        <SidebarContent>
            <Form
                data={props.values || {}}
                items={options}
                onChange={props.onChange}
            />
        </SidebarContent>
        <SidebarSubmit text="Export Image" onSubmit={props.onSubmit} />
    </Sidebar>
);

ExportSidebar.defaultProps = {
    values: {},
    onChange: null,
    onSubmit: null,
    onClose: null,
};
