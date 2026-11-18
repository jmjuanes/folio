import React from "react";
import { useEditor } from "../contexts/editor.tsx";
import { exportToDataURL } from "../lib/export.js";
import { FIELDS, TRANSPARENT } from "../constants.js";

export type ElementsPreviewParams = {
    elements: any[];
    width: number;
    height: number;
    background?: string;
    dependencies?: any[];
};

// tiny hook to generate a thumbnail of the elements
export const useElementsPreview = (params: ElementsPreviewParams): string | null => {
    const editor = useEditor();
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (params.elements.length > 1 || !params.elements[0]?.[FIELDS.CREATING]) {
            const previewOptions = {
                assets: editor.assets,
                width: params.width,
                height: params.height,
                background: params.background || TRANSPARENT,
            };
            exportToDataURL(params.elements, previewOptions).then(image => {
                return setPreviewImage(image);
            });
        }
    }, params.dependencies || []);
    return previewImage;
};
