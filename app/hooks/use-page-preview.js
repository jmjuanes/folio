import React from "react";
import {EXPORT_PADDING} from "../constants.js";
import {useScene} from "../contexts/scene.jsx";
import {exportToDataURL} from "../export.js";

export const PAGE_PREVIEW_WIDTH = 140;
export const PAGE_PREVIEW_HEIGHT = 80;

// Tiny hook to generate the preview of the page
export const usePagePreview = (page, width, height) => {
    const scene = useScene();
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        const previewOptions = {
            assets: scene.assets,
            width: (width || PAGE_PREVIEW_WIDTH) * 2,
            height: (height || PAGE_PREVIEW_HEIGHT) * 2,
            background: scene.background,
            padding: EXPORT_PADDING * 4,
        };
        exportToDataURL(page.elements, previewOptions).then(image => {
            return setPreviewImage(image);
        });
    }, [page.id, page.id === scene?.page?.id ? scene.updatedAt : null]);
    return previewImage;
};
