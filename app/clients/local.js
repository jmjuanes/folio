import * as idb from "idb-keyval";
import {VERSION} from "../constants.js";
import {migrate} from "../migrate.js";

// @private internal store version
const STORE_VERSION = "1";

// @private store keys
const STORE_KEYS = {
    VERSION: "folio:version",
    DATA: "folio:data",
    LIBRARY: "folio:library",
    SETTINGS: "folio:settings",
};

// @private internal IDB store
const store = idb.createStore("folio", "folio-store");

// @public create a new local client instance
export default () => ({
    config: {},
    session: {},

    // @description initialize local client and perform migration
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
            await idb.set(STORE_KEYS.SETTINGS, {}, store);
            await idb.set(STORE_KEYS.LIBRARY, [], store);
        }
        // Check if library is not initialized
        if (!keys.includes(STORE_KEYS.LIBRARY)) {
            await idb.set(STORE_KEYS.LIBRARY, [], store);
        }
        // Store initialized
        return true;
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

    // @description settings manager
    settings: {
        get: () => {
            return idb.get(STORE_KEYS.SETTINGS, store);
        },
        set: newSettings => {
            return idb.update(STORE_KEYS.SETTINGS, prev => ({...prev, newSettings}), store);
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
});
