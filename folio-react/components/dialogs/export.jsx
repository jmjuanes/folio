import React from "react";
import {ImageIcon, DownloadIcon, ClipboardIcon} from "@josemi-icons/react";
import {
    EXPORT_FORMATS,
    EXPORT_PADDING,
    FORM_OPTIONS,
    TRANSPARENT,
} from "../../constants.js";
import {
    exportToDataURL,
    exportToFile,
    exportToClipboard,
} from "../../lib/export.js";
import {Button} from "../ui/button.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {themed} from "../../contexts/theme.jsx";
import transparentBg from "../../assets/transparent.svg";

const previewStyle = {
    backgroundImage: `url('${transparentBg}')`,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
};

// @description content of the Export dialog
export const ExportDialog = () => {
    const editor = useEditor();
    const {hideDialog} = useDialog();
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

    // handle download action
    // @param {array} elements elements to export
    // @param {object} options export options
    const handleDownload = React.useCallback(() => {
        // TODO: display a notification if the export is successful
        return exportToFile(exportElements, exportOptions)
            .catch(error => console.error(error))
            .finally(() => hideDialog());
    }, [hideDialog, exportElements, exportOptions]);

    // handle copy to clipboard action
    // @param {array} elements elements to export
    // @param {object} options export options
    const handleCopyToClipboard = React.useCallback(() => {
        // TODO: display a notification if the export is successful
        return exportToClipboard(exportElements, exportOptions)
            .catch(error => console.error(error))
            .finally(() => hideDialog());
    }, [hideDialog, exportElements, exportOptions]);

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
            <Dialog.Header>
                <Dialog.Title>Export as image</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="">
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
            </Dialog.Body>
            <Dialog.Footer className="gap-2">
                <Button variant="secondary" className="w-full" onClick={handleDownload}>
                    <div className="flex items-center text-lg">
                        <DownloadIcon />
                    </div>
                    <div className="flex items-center">
                        <span>Download PNG</span>
                    </div>
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleCopyToClipboard}>
                    <div className="flex items-center text-lg">
                        <ClipboardIcon />
                    </div>
                    <div className="flex items-center">
                        <span>Copy to clipboard</span>
                    </div>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
