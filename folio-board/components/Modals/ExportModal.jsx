import React from "react";
import {EXPORT_FORMATS} from "folio-core";
import {Form} from "../Form/index.jsx";
import {ImageIcon, CodeIcon, DownloadIcon} from "../icons/index.jsx";
import {Button} from "../commons/Button.jsx";
import {Modal} from "./Modal.jsx";

const options = {
    filename: {
        type: "input",
        title: "File name",
        placeholder: "untitled",
    },
    // background: {
    //     type: "checkbox",
    //     title: "Backgorund",
    // },
    // scale: {
    //     type: "select",
    //     title: "Scale",
    //     values: [
    //         {value: 1, text: "1x"},
    //         {value: 2, text: "2x"},
    //         {value: 3, text: "3x"},
    //     ],
    //     grid: "3",
    // },
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

export const ExportModal = props => (
    <Modal title="Export" onClose={props.onClose}>
        <Form
            data={props.values || {}}
            items={options}
            onChange={props.onChange}
        />
        <div className="pt:10">
            <Button
                onClick={props.onSubmit}
                text="Export Image"
                icon={(<DownloadIcon />)}
            />
        </div>
    </Modal>
);

ExportModal.defaultProps = {
    values: {},
    onChange: null,
    onSubmit: null,
    onClose: null,
};
