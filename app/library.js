import {uid} from "uid/secure";
import {fileOpen, fileSave} from "browser-fs-access";
import {
    VERSION,
    FILE_EXTENSIONS,
    MIME_TYPES,
    LIBRARY_THUMBNAIL_BACKGROUND,
    LIBRARY_THUMBNAIL_HEIGHT,
    LIBRARY_THUMBNAIL_WIDTH,
} from "./constants.js";
import {exportToDataURL} from "./export.js";
import {getElementsBounds} from "./elements.js";
import {migrateElements} from "./migrate.js";
import {blobToText} from "./utils/blob.js";

// @description migrate a library
export const migrateLibrary = library => {
    return Object.assign({}, library, {
        version: VERSION, // set the current version
        id: library.id || uid(20), // generate a new id if not exists
        name: library.name || "Untitled", // set a default name
        description: library.description || "", // set a default description
        items: (library.items || []).map(item => {
            return Object.assign({}, item, {
                elements: migrateElements(item.elements, library.version || VERSION),
            });
        }),
    });
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
    const exportData = {
        type: MIME_TYPES.FOLIO_LIB,
        version: VERSION,
        name: library.name || "Untitled",
        description: library.description || "",
        items: library.items || [],
    };
    const dataStr = JSON.stringify(exportData, null, "    ");
    const blob = new Blob([dataStr], {type: MIME_TYPES.FOLIO_LIB});
    const name = (library.name || "untitled").trim().toLowerCase().replace(/ /g, "");
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
const getLibraryStateFromInitialData = initialData => {
    return migrateLibrary(initialData);
};

// @description create a new library manager
export const createLibrary = initialData => {
    const library = {
        ...getLibraryStateFromInitialData(initialData || {}),

        // @description load or export libraries
        toJSON: () => {
            return {
                version: library.version || VERSION,
                items: library.items,
            };
        },
        fromJSON: data => {
            Object.assign(library, getLibraryStateFromInitialData(data));
        },

        // @description clear library
        clear: () => {
            return library.fromJSON({});
        },

        // @description add a new item to the library
        addItem: (elements, data) => {
            const bounds = getElementsBounds(elements);
            return getLibraryItemThumbnail(elements).then(thumbnail => {
                library.items.push({
                    id: "lib:" + uid(20),
                    name: data.name || "Untitled",
                    description: data.description || "",
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
                    width: bounds.x2 - bounds.x1,
                    height: bounds.y2 - bounds.y1,
                });
            });

        },
        deleteItem: id => {
            library.items = library.items.filter(item => item.id !== id);
        },
        getItem: id => {
            return library.items.find(item => item.id === id) || null;
        },
    };
    // return library manager
    return library;
};
