import { uid } from "uid/secure";
import { fileOpen, fileSave } from "browser-fs-access";
import {
    VERSION,
    FILE_EXTENSIONS,
    MIME_TYPES,
    LIBRARY_THUMBNAIL_BACKGROUND,
    LIBRARY_THUMBNAIL_HEIGHT,
    LIBRARY_THUMBNAIL_WIDTH,
} from "../constants.js";
import { exportToDataURL } from "./export.js";
import { getElementsBoundingRectangle } from "./elements.js";
import { migrateElements } from "./migrate.js";
import { blobToText } from "../utils/blob.js";

// @description generate a random id for the library
// @returns {string} libraryId an unique identifier for a library item
export const generateLibraryId = (): string => "lib:" + uid(20);

// @description migrate a library
export const migrateLibrary = library => {
    return {
        // version: VERSION, // set the current version
        // name: library.name || "Untitled", // set a default name
        // description: library.description || "", // set a default description
        items: (library.items || []).map(item => {
            return Object.assign({}, item, {
                elements: migrateElements(item.elements, library.version || VERSION),
            });
        }),
    };
};

// @description allow to load a library from a local file
export const loadLibraryFromJson = async () => {
    const blob = await fileOpen({
        description: "Folio Library Import",
        extensions: [
            FILE_EXTENSIONS.FOLIO_LIB,
        ],
        multiple: false,
    });
    // Check if no blob file has been selected --> cancel load
    if (!blob) {
        return Promise.reject(new Error("No file selected"));
    }
    // Load data from blob
    const data = JSON.parse(await blobToText(blob));
    return migrateLibrary(data);
};

// @description allow to save a library to a local file
export const saveLibraryAsJson = library => {
    const libraryName = library.name || "Untitled";
    const exportData = {
        type: MIME_TYPES.FOLIO_LIB,
        version: VERSION,
        name: libraryName,
        description: library.description || "",
        items: library.items || [],
    };
    const dataStr = JSON.stringify(exportData, null, "    ");
    const blob = new Blob([dataStr], {type: MIME_TYPES.FOLIO_LIB});
    const name = libraryName.trim().toLowerCase().replace(/ /g, "");
    return fileSave(blob, {
        description: "Folio Library Export",
        fileName: name + FILE_EXTENSIONS.FOLIO_LIB,
        extensions: [
            FILE_EXTENSIONS.FOLIO_LIB,
        ],
    });
};

// @description generate a thumbnail for the library
export const getLibraryItemThumbnail = (elements = [], scale = 1) => {
    return exportToDataURL(elements, {
        width: LIBRARY_THUMBNAIL_WIDTH * scale,
        height: LIBRARY_THUMBNAIL_HEIGHT * scale,
        background: LIBRARY_THUMBNAIL_BACKGROUND,
    });
};

// @description generate libraries from initial libraries data
export const getLibraryStateFromInitialData = initialData => {
    return migrateLibrary(initialData);
};

// @description creates a new library item
// @param {array} elements list of elements that belongs to the new library item
// @param {object} data additional metadata for the library item
// @param {string} data.name name for the library item
// @param {string} data.description a description for the library item
export const createLibraryItem = (elements = [], data = {}) => {
    const bounds = getElementsBoundingRectangle(elements);
    return getLibraryItemThumbnail(elements).then(thumbnail => {
        return {
            id: generateLibraryId(),
            name: data?.name || "Untitled",
            description: data?.description || "",
            elements: elements.map(element => {
                // 1. generate a clone of the element and fix positions
                const newElement = Object.assign({}, element, {
                    x1: element.x1 - bounds.x1,
                    y1: element.y1 - bounds.y1,
                    x2: element.x2 - bounds.x1,
                    y2: element.y2 - bounds.y1,
                });
                // 2. fix the xCenter and yCenter if exists
                if (typeof element.xCenter === "number") {
                    newElement.xCenter = element.xCenter - bounds.x1;
                    newElement.yCenter = element.yCenter - bounds.y1;
                }
                // 3. return the new element
                return newElement;
            }),
            thumbnail: thumbnail,
            createdAt: Date.now(),
        };
    });
};
