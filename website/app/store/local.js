import * as idb from "idb-keyval";
import {VERSION} from "folio-react";
import {migrate} from "folio-react";

// @private internal store version
const STORE_VERSION = "1";

// @private store keys
const STORE_KEYS = {
    VERSION: "folio:version",
    DATA: "folio:data",
    LIBRARY: "folio:library",
    PREFERENCES: "folio:preferences",
};

// @description create a new local store instance
// @param {object} options local store options
// @param {string} options.key key to use for the IDB store (aka database name)
// @returns {object} store local store manager
// @returns {function} store.initialize method to initialize the store
// @returns {object} store.data data namager that implements the get and set methods
// @returns {object} store.library library manager that implements the get and set methods
// @returns {object} store.preferences preferences manager that implements the get and set methods
export const createLocalStore = (options = {}) => {
    const databaseName = options.key || "folio"; // database to use
    const store = idb.createStore(databaseName, "folio-store");
    return {
        // @description initialize local store and perform migration
        initialize: async () => {
            const keys = await idb.keys(store);
            // Check if we need to migrate to new projects data
            if (!keys.includes(STORE_KEYS.VERSION)) {
                // 1. Initialize new data object
                const newData = {
                    pages: [],
                    assets: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                // 2. Read all old store keys. Each item will be a new page
                for (let i = 0; i < keys.length; i++) {
                    const data = await idb.get(keys[i], store);
                    newData.pages.push({
                        id: keys[i],
                        title: data.title || `Page ${newData.pages.length + 1}`,
                        elements: data.elements,
                    });
                    Object.assign(newData.assets, data.assets || {});
                    await idb.del(keys[i], store);
                }
                // Create new store keys
                await idb.set(STORE_KEYS.VERSION, STORE_VERSION, store)
                await idb.set(STORE_KEYS.DATA, newData, store);
                await idb.set(STORE_KEYS.PREFERENCES, {}, store);
            }
            // Check if library is not initialized
            if (!keys.includes(STORE_KEYS.LIBRARY)) {
                await idb.set(STORE_KEYS.LIBRARY, {}, store);
            }
        },

        // @description data manager
        data: {
            get: async () => {
                let data = await idb.get(STORE_KEYS.DATA, store);
                // Check if we need to perform an upgrade to the new version
                if (data?.version !== VERSION) {
                    // NOTE: we found that before v11 version was not saved in local storage
                    // In that case, we assume that version is 10
                    data = await migrate({...data}, data.version || "10");
                    await idb.set(STORE_KEYS.DATA, data, store);
                }
                // Return migrated data
                return data;
            },
            set: data => {
                return idb.update(STORE_KEYS.DATA, prev => ({...prev, ...data}), store);
            },
        },

        // @description library manager
        library: {
            get: () => {
                return idb.get(STORE_KEYS.LIBRARY, store);
            },
            set: library => {
                return idb.set(STORE_KEYS.LIBRARY, library, store);
            },
        },

        // @description preferences manager
        preferences: {
            get: () => {
                return idb.get(STORE_KEYS.PREFERENCES, store);
            },
            set: newPreferences => {
                return idb.set(STORE_KEYS.PREFERENCES, newPreferences, store);
            },
        },
    };
};
