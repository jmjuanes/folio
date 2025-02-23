import React from "react";
import {ImageIcon, DownloadIcon, ClipboardIcon} from "@josemi-icons/react";
import {EXPORT_FORMATS, EXPORT_PADDING, FORM_OPTIONS, TRANSPARENT} from "../../constants.js";
import {exportToDataURL} from "../../export.js";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {themed} from "../../contexts/theme.jsx";
import transparentBg from "../../assets/transparent.svg";

const previewStyle = {
    backgroundImage: `url('${transparentBg}')`,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
};

export const ExportDialog = props => {
    const editor = useEditor();
    const elements = editor.getElements();
    const [previewImage, setPreviewImage] = React.useState(null);
    const [options, setOptions] = React.useState({
        includeBackground: true,
        onlySelectedElements: elements.every(el => el.selected),
    });
    // Utility function to generate export options
    const [exportElements, exportOptions] = React.useMemo(() => {
        const exportElements = elements.filter(el => {
            return options.onlySelectedElements ? el.selected : true;
        });
        const exportOptions = {
            assets: editor.assets,
            format: EXPORT_FORMATS.PNG,
            background: options.includeBackground ? editor.background : TRANSPARENT,
            padding: EXPORT_PADDING,
        };
        return [exportElements, exportOptions];
    }, [options.includeBackground, options.onlySelectedElements]);
    // Generate export fields
    const exportFields = React.useMemo(() => {
        const hasElementsSelected = elements.some(el => el.selected);
        const allElementsSelected = elements.every(el => el.selected);
        return {
            includeBackground: {
                type: FORM_OPTIONS.CHECKBOX,
                title: "Include background",
                helper: "Include the editor background in the exported image.",
            },
            onlySelectedElements: {
                type: FORM_OPTIONS.CHECKBOX,
                title: "Only selected elements",
                disabled: !hasElementsSelected || allElementsSelected,
                helper: "Include only the selected elements in the exported image.",
            },
        };
    }, [elements.length]);
    // Handle preview update when an option is changed
    React.useEffect(() => {
        // TODO: we would need to delay the preview update if we depend on another option, for example padding,
        // so we can just update the preview once for multiple consecutive changes.
        exportToDataURL(exportElements, exportOptions).then(data => {
            return setPreviewImage(data);
        });
    }, [options.includeBackground, options.onlySelectedElements]);

    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-md relative">
                    <Dialog.Close onClick={props.onCancel} />
                    <Dialog.Header className="mb-4">
                        <Dialog.Title>Export Image</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <div className={themed("select-none mb-4 rounded-lg overflow-hidden", "export.preview")}>
                            {!!previewImage && (
                                <div className="flex items-center justify-center h-48" style={previewStyle}>
                                    <img src={previewImage} className="max-h-48" />
                                </div>
                            )}
                            {!previewImage && (
                                <div className="flex flex-col items-center justify-center gap-1 h-48">
                                    <div className="flex text-lg">
                                        <ImageIcon />
                                    </div>
                                    <span className="text-xs">
                                        Generating preview...
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mb-8">
                            <Form
                                data={options}
                                items={exportFields}
                                onChange={(key, value) => {
                                    setOptions(prevOptions => ({
                                        ...prevOptions,
                                        [key]: value,
                                    }));
                                }}
                            />
                        </div>
                    </Dialog.Body>
                    <div className="flex gap-2 w-full flex-col">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => props.onDownload(exportElements, exportOptions)}
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
                            onClick={() => props.onCopyToClipboard(exportElements, exportOptions)}
                        >
                            <div className="flex items-center text-lg">
                                <ClipboardIcon />
                            </div>
                            <div className="flex items-center">
                                <span>Copy to clipboard</span>
                            </div>
                        </Button>
                    </div>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
