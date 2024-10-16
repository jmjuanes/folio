import {uid} from "uid/secure";

// @description create a new library
export const createLibrary = data => ({
    id: uid(20),
    name: data.name || "",
    description: data.description || "",
    items: [],
    createdAt: Date.now(),
    // updatedAt: Date.now(),
});

// @description allow to load a library from a local file
export const loadLibrary = () => {

};

// @description generate libraries from initial libraries data
const getLibrariesMapFromInitialData = initialLibraries => {
    return new Map(initialLibraries.map(library => [library.id, library]));
};

// @description create a new library manager
export const createLibraryManager = initialLibraries => {
    const manager = {
        libraries: getLibrariesMapFromInitialData(initialLibraries),

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

        // Add a new item to a library

    };
    // return libraries manager
    return manager;
};
