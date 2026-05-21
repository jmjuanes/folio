import { Fragment, useEffect, useCallback, useState, useMemo } from "react";
import { useAlure as useSurface } from "alure";
import { ImageIcon, DownloadIcon, ClipboardIcon } from "@josemi-icons/react";
import {
    EXPORT_FORMATS,
    EXPORT_PADDING,
    FORM_OPTIONS,
    TRANSPARENT,
} from "../constants.js";
import {
    exportToDataURL,
    exportToFile,
    exportToClipboard,
} from "../lib/export.js";
import { Button } from "./ui/button.tsx";
import { Centered } from "./ui/centered.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay } from "./ui/overlay.tsx";
import { Form } from "./form/index.jsx";
import { useEditor } from "../contexts/editor.tsx";
import transparentBg from "../assets/transparent.svg";
import type { JSX, ReactNode } from "react";

const previewStyle = {
    backgroundImage: `url('${transparentBg}')`,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
};

export const ExportContent = (): JSX.Element => {
    const editor = useEditor();
    const { close } = useSurface();
    const elements = editor.getElements();
    const [previewImage, setPreviewImage] = useState(null);
    const [options, setOptions] = useState({
        includeBackground: true,
        onlySelectedElements: elements.every((el: any) => el.selected),
    });

    // Utility function to generate export options
    const [exportElements, exportOptions] = useMemo(() => {
        const exportElements = elements.filter((el: any) => {
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
    const exportFields = useMemo(() => {
        const hasElementsSelected = elements.some((el: any) => el.selected);
        const allElementsSelected = elements.every((el: any) => el.selected);
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
    const handleDownload = useCallback(() => {
        // TODO: display a notification if the export is successful
        return exportToFile(exportElements, exportOptions)
            .catch(error => console.error(error))
            .finally(() => close());
    }, [close, exportElements, exportOptions]);

    // handle copy to clipboard action
    // @param {array} elements elements to export
    // @param {object} options export options
    const handleCopyToClipboard = useCallback(() => {
        // TODO: display a notification if the export is successful
        return exportToClipboard(exportElements, exportOptions)
            .catch(error => console.error(error))
            .finally(() => close());
    }, [close, exportElements, exportOptions]);

    // Handle preview update when an option is changed
    useEffect(() => {
        // TODO: we would need to delay the preview update if we depend on another option, for example padding,
        // so we can just update the preview once for multiple consecutive changes.
        exportToDataURL(exportElements, exportOptions).then(data => {
            return setPreviewImage(data);
        });
    }, [options.includeBackground, options.onlySelectedElements]);

    return (
        <Fragment>
            <div className="select-none mb-4 rounded-lg overflow-hidden text-gray-500 border-1 border-gray-200">
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
                onChange={(key: string, value: any) => {
                    setOptions(prevOptions => ({
                        ...prevOptions,
                        [key]: value,
                    }));
                }}
            />
            <div className="flex flex-col gap-2">
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
            </div>
        </Fragment>
    );
};

export type ExportProps = {
    title?: string;
    children?: ReactNode;
};

export const Export = (props: ExportProps): JSX.Element => {
    const { close } = useSurface();
    const content = props.children ?? <ExportContent />;
    return (
        <Fragment>
            <Overlay className="z-50" onClick={() => close()} />
            <Centered className="fixed z-50 h-full">
                <Dialog.Content className="relative w-full max-w-md">
                    <Dialog.Close onClick={() => close()} />
                    <Dialog.Header>
                        <Dialog.Title>{props.title || "Export as image"}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body className="">
                        {content}
                    </Dialog.Body>
                </Dialog.Content>
            </Centered>
        </Fragment>
    );
};
