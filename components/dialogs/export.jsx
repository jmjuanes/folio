import React from "react";
import {Button, Centered, Overlay, Modal} from "@josemi-ui/react";
import {ImageIcon, DownloadIcon, ClipboardIcon} from "@josemi-icons/react";
import {EXPORT_FORMATS, EXPORT_PADDING, TRANSPARENT} from "@lib/constants.js";
import {exportToDataURL, exportToFile, exportToClipboard} from "@lib/export.js";
import {Form} from "@components/commons/form.jsx";
import {useBoard} from "@components/contexts/board.jsx";

import transparentBg from "../../assets/transparent.svg";

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

const ExportPreview = props => (
    <div data-testid="export-preview" className="select-none mb-4 rounded border border-neutral-200">
        {!!props.data && (
            <div className="flex items-center justify-center h-48" style={previewStyle}>
                <img
                    data-testid="export-preview-image"
                    src={props.data}
                    className="max-h-48"
                />
            </div>
        )}
        {!props.data && (
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
);

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
    // Handle copy to clipboard
    const handleCopyToClipboard = () => {
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
    };
    // Handle export to file
    const handleExportToFile = () => {
        return exportToFile(getExportOptions());
    };
    return (
        <React.Fragment>
            <Overlay />
            <Centered className="fixed z-10 h-full">
                <Modal className="max-w-sm">
                    <Modal.Header className="mb-4">
                        <Modal.Title>Export Image</Modal.Title>
                        <Modal.Close
                            onClick={props.onClose}
                        />
                    </Modal.Header>
                    <Modal.Body>
                        <ExportPreview
                            data={preview}
                        />
                        <div className="mb-8">
                            <Form
                                data={options}
                                items={formOptions}
                                onChange={(key, value) => {
                                    setOptions(prevOptions => ({
                                        ...prevOptions,
                                        [key]: value,
                                    }));
                                }}
                            />
                        </div>
                    </Modal.Body>
                    <div className="flex gap-2 w-full flex-col">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleExportToFile}
                        >
                            <div className="flex items-center text-lg">
                                <DownloadIcon />
                            </div>
                            <div className="flex items-center">
                                <span>Download PNG</span>
                            </div>
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleCopyToClipboard}
                        >
                            <div className="flex items-center text-lg">
                                <ClipboardIcon />
                            </div>
                            <div className="flex items-center">
                                <span>{copiedToClipboard ? "Copied!" : "Copy to clipboard"}</span>
                            </div>
                        </Button>
                    </div>
                </Modal>
            </Centered>
        </React.Fragment>
    );
};

ExportDialog.defaultProps = {
    copiedToClipboardMessageDelay: 2000,
    cropRegion: null,
    onClose: null,
};
