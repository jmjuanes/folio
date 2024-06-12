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
export default () => ({
    config: {},
    session: {},

    // @description initialize local client and perform migration
    initialize: async () => {
        const keys = await idb.keys(store);
        // Check if we need to initialize store
        if (keys.length === 0) {
            await idb.set(STORE_KEYS.VERSION, STORE_VERSION, store)
            await idb.set(STORE_KEYS.DATA, {}, store);
            await idb.set(STORE_KEYS.SETTINGS, {}, store);
        }
        // Store initialized
        return true;
    },

    // @description recover data from old store
    recover: async () => {
        const keys = await idb.keys(store);
        // Check if store has been initialized
        // This is just a check, because the 'initialize' method should have been initialized the store keys
        if (keys.length > 0) {
            let data = {title: "Untitled", pages: [], assets: {}};
            // Check if store keys are from old versions
            if (!keys.includes(STORE_KEYS.VERSION)) {
                // Read all old store keys. Each item will be a new page
                for (let i = 0; i < keys.length; i++) {
                    const currentData = await idb.get(keys[i], store);
                    data.pages.push({
                        id: keys[i],
                        title: currentData.title || `Page ${data.pages.length + 1}`,
                        elements: currentData.elements,
                    });
                    Object.assign(data.assets, currentData.assets || {});
                    // await idb.del(keys[i], store);
                }
            }
            // If we have new versions data, just get the data
            else {
                data = await idb.get(STORE_KEYS.DATA, store);
            }
            return data?.pages?.length > 0 ? [data] : []; 
        }
        // No data to recover
        return [];
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
});
