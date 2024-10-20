import {uid} from "uid/secure";
import {fileOpen, fileSave} from "browser-fs-access";
import {
    VERSION,
    FILE_EXTENSIONS,
    MIME_TYPES,
    LIBRARIES_THUMBNAIL_BACKGROUND,
    LIBRARIES_THUMBNAIL_HEIGHT,
    LIBRARIES_THUMBNAIL_WIDTH,
} from "./constants.js";
import {exportToDataURL} from "./export.js";
import {getElementsBounds} from "./elements.js";
import {migrateElements} from "./migrate.js";
import {blobToText} from "./utils/blob.js";

// @description migrate a library
export const migrateLibrary = library => {
    return Object.assign({}, library, {
        version: VERSION, // set the current version
        readonly: !!library.readonly,
        items: (library.items || []).map(item => {
            return Object.assign({}, item, {
                elements: migrateElements(item.elements, library.version || VERSION),
            });
        }),
    });
};

// @description create a new library
export const createLibrary = data => ({
    id: "lib:" + uid(20),
    version: VERSION,
    name: data.name || "Untitled",
    description: data.description || "",
    author: data.author || "",
    tags: data.tags || [],
    readonly: !!data.readonly,
    items: data.items || [],
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
});

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
        ...library,
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
        width: LIBRARIES_THUMBNAIL_WIDTH * scale,
        height: LIBRARIES_THUMBNAIL_HEIGHT * scale,
        background: LIBRARIES_THUMBNAIL_BACKGROUND,
    });
};

// @description generate libraries from initial libraries data
const getLibrariesMapFromInitialData = initialLibraries => {
    return new Map(initialLibraries.map(library => {
        return [library.id, migrateLibrary(library)];
    }));
};

// @description create a new library manager
export const createLibraryManager = initialLibraries => {
    const manager = {
        libraries: getLibrariesMapFromInitialData(initialLibraries),

        // @description load or export libraries
        toJSON: () => {
            return Array.from(manager.libraries.values());
        },
        fromJSON: data => {
            manager.libraries = getLibrariesMapFromInitialData(data);
        },

        // @description manage library
        add: library => {
            manager.libraries.set(library.id, library);
        },
        update: (id, data) => {
            if (manager.libraries.has(id)) {
                Object.assign(manager.libraries.get(id), data, {
                    updatedAt: Date.now(),
                });
            }
        },
        delete: id => {
            manager.libraries.delete(id);
        },
        get: id => {
            return manager.libraries.get(id);
        },
        getAll: () => {
            return Array.from(manager.libraries.values());
        },
        count: () => {
            return manager.libraries.size;
        },

        // @description get private libraries (user libraries)
        getPrivate: () => {
            return manager.getAll().filter(library => library.private);
        },

        // Add a new item to a library
        addLibraryItem: (libraryId, elements, data) => {
            const library = manager.get(libraryId);
            if (library.readonly) {
                return; // we can not add items to a readonly library
            }
            const bounds = getElementsBounds(elements);
            return getLibraryItemThumbnail(elements).then(thumbnail => {
                library.items.push({
                    id: "lib:" + libraryId + "/" + uid(20),
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
                library.updatedAt = Date.now();
            });
        },
        getLibraryItem: (libraryId, itemId) => {
            return manager.get(libraryId)?.items?.find(item => item.id === itemId) || null;
        },
        deleteLibraryItem: (libraryId, itemId) => {
            const library = manager.get(libraryId);
            library.items = library.items.filter(item => item.id !== itemId);
            library.updatedAt = Date.now();
        },
    };
    // return libraries manager
    return manager;
};
