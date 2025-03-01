import React from "react";
import {EXPORT_PADDING} from "../constants.js";
import {useEditor} from "../contexts/editor.jsx";
import {exportToDataURL} from "../export.js";

export const PAGE_PREVIEW_WIDTH = 140;
export const PAGE_PREVIEW_HEIGHT = 80;

// Tiny hook to generate the preview of the page
export const usePagePreview = (page, width, height) => {
    const editor = useEditor();
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        const previewOptions = {
            assets: editor.assets,
            width: (width || PAGE_PREVIEW_WIDTH) * 2,
            height: (height || PAGE_PREVIEW_HEIGHT) * 2,
            background: editor.background,
            padding: EXPORT_PADDING * 4,
        };
        exportToDataURL(page.elements, previewOptions).then(image => {
            return setPreviewImage(image);
        });
    }, [page.id, page.id === editor?.page?.id ? editor.updatedAt : null]);
    return previewImage;
};
