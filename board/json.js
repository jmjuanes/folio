import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS} from "../constants.js";
import {BACKGROUND_COLORS} from "../utils/colors.js";
import {migrateAssets, migrateElements} from "./migrate.js";

// Read from blob as text
const readBlobAsText = blob => {
    const file = new FileReader();
    return (new Promise((resolve, reject) => {
        file.onload = event => resolve(event.target.result);
        file.onerror = error => reject(error);
        file.readAsText(blob, "utf8");
    }));
};

export const saveAsJson = options => {
    const elements = options?.elements || [];
    const exportData = {
        type: MIME_TYPES.FOLIO,
        source: "",
        version: VERSION,
        elements: elements,
        assets: elements.reduce((assets, element) => {
            // Copy only assets in the elements list
            if (element.assetId && options?.assets?.[element.assetId]) {
                assets[element.assetId] = options.assets[element.assetId];
            }
            return assets;
        }, {}),
        background: options?.background || BACKGROUND_COLORS.gray,
        grid: !!options?.grid,
        attributes: options?.attributes || {},
    };
    const data = JSON.stringify(exportData, null, "    ");
    const blob = new Blob([data], {type: MIME_TYPES.FOLIO});
    return fileSave(blob, {
        description: "Folio Export",
        fileName: `${options.name || "untitled"}${FILE_EXTENSIONS.FOLIO}`,
        extensions: [
            FILE_EXTENSIONS.FOLIO,
        ],
    });
};

export const loadFromJson = async () => {
    const blob = await fileOpen({
        description: "Folio Import",
        extensions: [
            FILE_EXTENSIONS.FOLIO,
        ],
        multiple: false,
    });
    // Check if no blob file has been selected --> cancel load
    if (!blob) {
        return Promise.reject(new Error("No file selected"));
    }
    // Load data from blob
    const data = JSON.parse(await readBlobAsText(blob));
    return {
        version: VERSION,
        elements: migrateElements(data.elements, data.version),
        assets: migrateAssets(data.assets, data.version),
        background: data.background || BACKGROUND_COLORS.gray,
        grid: !!data.grid,
        attributes: data.attributes || {},
    };
};
