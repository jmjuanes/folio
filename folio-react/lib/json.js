import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS} from "../constants.js";
import {blobToText} from "../utils/blob.js";
import {BACKGROUND_COLORS} from "../utils/colors.js";
import {migrate} from "./migrate.js";

export const saveAsJson = data => {
    const pages = data?.pages || [];
    const exportData = {
        type: MIME_TYPES.FOLIO,
        version: VERSION,
        title: data?.title || "Untitled",
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        pages: pages,
        assets: pages.reduce((assets, page) => {
            // Copy only assets in the elements list
            (page?.elements || []).forEach(element => {
                if (element.assetId && data?.assets?.[element.assetId]) {
                    assets[element.assetId] = data.assets[element.assetId];
                }
            });
            return assets;
        }, {}),
        background: data?.background ?? BACKGROUND_COLORS.gray,
        appState: data?.appState ?? {},
        metadata: Object.assign(data?.metadata || {}, {
            source: `folio v${process.env.VERSION}`,
        }),
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
    const data = JSON.parse(await blobToText(blob));
    return migrate(data, data?.version);
};
