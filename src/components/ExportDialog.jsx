import React from "react";
import {ImageIcon, CloseIcon, DownloadIcon, ClipboardIcon} from "@mochicons/react";
import {EXPORT_FORMATS, EXPORT_PADDING} from "folio-core";
import {exportToDataURL, exportToFile, exportToClipboard} from "folio-core";
import {Modal} from "./commons/Modal.jsx";
import {SecondaryButton} from "./commons/Button.jsx";
import {Form} from "./commons/Form.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";

const formOptions = {
    includeBackground: {
        type: "checkbox",
        title: "Include background",
    },
};

export const ExportDialog = props => {
    const board = useBoard();
    const [preview, setPreview] = React.useState(null);
    const [options, setOptions] = React.useState({
        includeBackground: true,
    });
    // Utility function to generate export options
    const getExportOptions = format => {
        return {
            elements: board.elements,
            format: format || EXPORT_FORMATS.PNG,
            background: options.includeBackground ? board.background : "transparent",
            padding: EXPORT_PADDING,
        };
    };
    // Handle preview update when an option is changed
    React.useEffect(
        () => {
            // TODO: we would need to delay the preview update if we depend on another option, for example padding,
            // so we can just update the preview once for multiple consecutive changes.
            exportToDataURL(getExportOptions()).then(data => {
                setPreview(data);
            });
        },
        [options.includeBackground],
    );
    return (
        <Modal maxWidth={props.width}>
            <div className="flex items-center justify-between mb-8">
                <div className="font-bold text-lg">Export image</div>
                <div className="flex items-center cursor-pointer text-2xl text-gray-500 hover:text-gray-700" onClick={props.onClose}>
                    <CloseIcon />
                </div>
            </div>
            <div className="select-none mb-4 border border-gray-300">
                <div className="flex items-center justify-center h-48">
                    {!!preview && (
                        <img src={preview} className="maxh-48" />
                    )}
                    {!preview && (
                        <React.Fragment>
                            <div className="flex text-lg text-gray-400">
                                <ImageIcon />
                            </div>
                            <span className="text-xs text-gray-400">Generating preview...</span>
                        </React.Fragment>
                    )}
                </div>
            </div>
            <div className="mb-8">
                <Form
                    data={options}
                    items={formOptions}
                    onChange={(key, value) => {
                        setOptions(prevOptions => ({...prevOptions, [key]: value}));
                    }}
                />
            </div>
            <div className="flex gap-2 w-full flex-col">
                <SecondaryButton
                    text="Download PNG"
                    icon={(<DownloadIcon />)}
                    fullWidth={true}
                    onClick={() => exportToFile(getExportOptions())}
                />
                <SecondaryButton
                    text="Copy to clipboard"
                    icon={(<ClipboardIcon />)}
                    fullWidth={true}
                    onClick={() => exportToClipboard(getExportOptions())}
                />
            </div>
        </Modal>
    );
};

ExportDialog.defaultProps = {
    width: "20rem",
    onClose: null,
};
