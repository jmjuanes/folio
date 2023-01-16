import React from "react";
import {EXPORT_FORMATS, exportToFile} from "folio-core";
import {FONT_FACES} from "../../constants.js";
import {Form} from "../Form/index.jsx";
import {ImageIcon, CodeIcon, DownloadIcon} from "../icons/index.jsx";
import {Button} from "../commons/Button.jsx";
import {useToasts} from "../../contexts/ToastContext.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {Modal} from "./Modal.jsx";
import {formatDate} from "../../utils/date.js";

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

export const ExportModal = props => {
    const {addToast} = useToasts();
    const board = useBoard();
    const [values, setValues] = React.useState({
        elements: board.getElements(),
        filename: `untitled-${formatDate()}`,
        format: EXPORT_FORMATS.PNG,
        background: false,
        fonts: Object.values(FONT_FACES),
        scale: 1,
    });

    const handleSubmit = () => {
        exportToFile(values)
            .then(filename => {
                addToast(`Board exported as '${filename}'`);
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => props.onClose());
    };

    return (
        <Modal title="Export" onClose={props.onClose}>
            <Form
                data={values}
                items={options}
                onChange={(key, value) => {
                    return setValues(prevValues => ({
                        ...prevValues,
                        [key]: value,
                    }));
                }}
            />
            <div className="pt:10">
                <Button
                    text="Export Image"
                    icon={(<DownloadIcon />)}
                    onClick={handleSubmit}
                />
            </div>
        </Modal>
    );
};

ExportModal.defaultProps = {
    onClose: null,
};
