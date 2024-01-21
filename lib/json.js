import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS} from "@lib/constants.js";
import {BACKGROUND_COLORS} from "@lib/utils/colors.js";
import {migrate} from "@lib/migrate.js";

// Read from blob as text
const readBlobAsText = blob => {
    const file = new FileReader();
    return (new Promise((resolve, reject) => {
        file.onload = event => resolve(event.target.result);
        file.onerror = error => reject(error);
        file.readAsText(blob, "utf8");
    }));
};

export const saveAsJson = data => {
    const elements = data?.elements || [];
    const exportData = {
        type: MIME_TYPES.FOLIO,
        source: null,
        version: VERSION,
        title: data?.title || "Untitled",
        thumbnail: null,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        elements: elements,
        assets: elements.reduce((assets, element) => {
            // Copy only assets in the elements list
            if (element.assetId && data?.assets?.[element.assetId]) {
                assets[element.assetId] = data.assets[element.assetId];
            }
            return assets;
        }, {}),
        background: data?.background ?? BACKGROUND_COLORS.gray,
        grid: !!data?.grid,
    };
    const dataStr = JSON.stringify(exportData, null, "    ");
    const blob = new Blob([dataStr], {type: MIME_TYPES.FOLIO});
    const name = (data.title || "untitled").trim().toLowerCase().replace(/ /g, "");
    return fileSave(blob, {
        description: "Folio Export",
        fileName: name + FILE_EXTENSIONS.FOLIO,
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
    return migrate(data, data?.version);
};
