import {uid} from "uid/secure";
import {
    LIBRARIES_THUMBNAIL_BACKGROUND,
    LIBRARIES_THUMBNAIL_HEIGHT,
    LIBRARIES_THUMBNAIL_WIDTH,
} from "./constants.js";
import {exportToDataURL} from "./export.js";
import {getElementsBounds} from "./elements.js";

// @description create a new library
export const createLibrary = data => ({
    id: uid(20),
    name: data.name || "Untitled",
    description: data.description || "",
    author: data.author || "",
    tags: data.tags || [],
    private: true,
    items: [],
    createdAt: Date.now(),
    // updatedAt: Date.now(),
});

// @description allow to load a library from a local file
export const loadLibrary = () => {

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
    return new Map(initialLibraries.map(library => [library.id, library]));
};

// @description create a new library manager
export const createLibraryManager = initialLibraries => {
    const manager = {
        // libraries: getLibrariesMapFromInitialData(initialLibraries),
        libraries: getLibrariesMapFromInitialData([createLibrary({name: "Default Library"})]),

        // @description add a new library
        add: data => {
            const newLibrary = createLibrary(data);
            manager.libraries.set(newLibrary.id, newLibrary);
            return newLibrary;
        },
        update: (id, data) => {
            if (!manager.libraries.has(id)) {
                Object.assign(manager.libraries.get(id), data);
            }
        },
        delete: id => {
            manager.libraries.delete(id);
        },

        // @description get a library by id
        get: id => {
            return manager.libraries.get(id);
        },

        // @description get all libraries
        getAll: () => {
            return Array.from(manager.libraries.values());
        },

        // @description get private libraries (user libraries)
        getPrivate: () => {
            return manager.getAll().filter(library => library.private);
        },

        // Add a new item to a library
        addLibraryItem: (id, elements, data) => {
            const library = manager.get(id);
            const bounds = getElementsBounds(elements);
            return getLibraryItemThumbnail(elements).then(thumbnail => {
                library.items.push({
                    id: uid(20),
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

    };
    // return libraries manager
    return manager;
};
