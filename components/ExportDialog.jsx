import React from "react";

import {EXPORT_FORMATS, EXPORT_PADDING, TRANSPARENT} from "../constants.js";
import {exportToDataURL, exportToFile, exportToClipboard} from "../board/export.js";
import {Modal} from "./Modal.jsx";
import {SecondaryButton} from "./Button.jsx";
import {Form} from "./Form.jsx";
import {ImageIcon, CloseIcon, DownloadIcon, ClipboardIcon} from "./Icons.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";

import transparentBg from "../assets/transparent.svg";

const formOptions = {
    includeBackground: {
        type: "checkbox",
        title: "Include background",
    },
};

const previewStyle = {
    backgroundImage: `url('${transparentBg}')`,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
};

export const ExportDialog = props => {
    const board = useBoard();
    const copiedToClipboardTimer = React.useRef(null);
    const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);
    const [preview, setPreview] = React.useState(null);
    const [options, setOptions] = React.useState({
        includeBackground: true,
    });
    // Utility function to generate export options
    const getExportOptions = format => {
        return {
            elements: board.elements,
            format: format || EXPORT_FORMATS.PNG,
            background: options.includeBackground ? board.background : TRANSPARENT,
            padding: !!props.cropRegion ? 0 : EXPORT_PADDING,
            crop: props.cropRegion,
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
    // On unmount export dialog --> reset copied to clipboard timer
    React.useEffect(
        () => {
            return () => {
                if (copiedToClipboardTimer.current) {
                    clearTimeout(copiedToClipboardTimer.current);
                }
            };
        },
        [],
    );
    return (
        <Modal title="Export Image" onClose={props.onClose} maxWidth={props.width}>
            <div data-testid="export-preview" className="select-none mb-4 rounded border-2 border-neutral-200">
                {!!preview && (
                    <div className="flex items-center justify-center h-48" style={previewStyle}>
                        <img
                            data-testid="export-preview-image"
                            src={preview}
                            className="maxh-48"
                        />
                    </div>
                )}
                {!preview && (
                    <div className="flex items-center justify-center h-48">
                        <div className="flex text-lg text-neutral-400">
                            <ImageIcon />
                        </div>
                        <span className="text-xs text-neutral-400">
                            Generating preview...
                        </span>
                    </div>
                )}
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
                    testid="export-btn-download"
                    text="Download PNG"
                    icon={(<DownloadIcon />)}
                    fullWidth={true}
                    onClick={() => exportToFile(getExportOptions())}
                />
                <SecondaryButton
                    testid="export-btn-clipboard"
                    text={copiedToClipboard ? "Copied!" : "Copy to clipboard"}
                    icon={(<ClipboardIcon />)}
                    fullWidth={true}
                    onClick={() => {
                        // First check if there is an active timer
                        if (copiedToClipboardTimer.current) {
                            setTimeout(copiedToClipboardTimer.current);
                        }
                        setCopiedToClipboard(true);
                        exportToClipboard(getExportOptions());
                        // Delay reseting the current timer
                        copiedToClipboardTimer.current = setTimeout(
                            () => {
                                setCopiedToClipboard(false);
                                copiedToClipboardTimer.current = null;
                            },
                            props.copiedToClipboardMessageDelay,
                        );
                    }}
                />
            </div>
        </Modal>
    );
};

ExportDialog.defaultProps = {
    width: "22rem",
    copiedToClipboardMessageDelay: 2000,
    cropRegion: null,
    onClose: null,
};
