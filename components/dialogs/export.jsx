import React from "react";
import {Button, Centered, Overlay, Modal} from "@josemi-ui/react";
import {ImageIcon, DownloadIcon, ClipboardIcon} from "@josemi-icons/react";
import {EXPORT_FORMATS, EXPORT_PADDING, TRANSPARENT} from "@lib/constants.js";
import {exportToDataURL, exportToFile, exportToClipboard} from "@lib/export.js";
import {Form} from "@components/commons/form.jsx";
import {useScene} from "@contexts/scene.jsx";

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
    const scene = useScene();
    const [preview, setPreview] = React.useState(null);
    const [options, setOptions] = React.useState({
        includeBackground: true,
    });

    // Utility function to generate export options
    const getExportOptions = format => {
        return {
            elements: scene.getElements(),
            format: format || EXPORT_FORMATS.PNG,
            background: options.includeBackground ? scene.background : TRANSPARENT,
            padding: EXPORT_PADDING,
            crop: props.crop,
        };
    };

    // Handle preview update when an option is changed
    React.useEffect(() => {
        // TODO: we would need to delay the preview update if we depend on another option, for example padding,
        // so we can just update the preview once for multiple consecutive changes.
        exportToDataURL(getExportOptions()).then(data => {
            setPreview(data);
        });
    }, [options.includeBackground]);

    // Handle copy to clipboard
    const handleCopyToClipboard = () => {
        exportToClipboard(getExportOptions())
            .finally(() => props.onClose());
    };

    // Handle export to file
    const handleExportToFile = () => {
        exportToFile(getExportOptions())
            .finally(() => props.onClose());
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
                                <span>Copy to clipboard</span>
                            </div>
                        </Button>
                    </div>
                </Modal>
            </Centered>
        </React.Fragment>
    );
};

ExportDialog.defaultProps = {
    crop: null,
    onClose: null,
};
