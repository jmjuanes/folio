import * as idb from "idb-keyval";
import {VERSION} from "../constants.js";
import {migrate} from "../migrate.js";

// @private internal store version
const STORE_VERSION = "1";

// @private store keys
const STORE_KEYS = {
    VERSION: "folio:version",
    DATA: "folio:data",
    SETTINGS: "folio:settings",
};

// @private internal IDB store
const store = idb.createStore("folio", "folio-store");

// @public create a new local client instance
export const createLocalClient = () => ({
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
        }
        // Store initialized
        return true;
    },

    // @description data manager
    data: {
        get: async () => {
            const data = await idb.get(STORE_KEYS.DATA, store);
            // Check if we need to perform an upgrade to the new version
            if (data?.version && data?.version !== VERSION) {
                Object.assign(data, migrate(data, data.version));
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
});
