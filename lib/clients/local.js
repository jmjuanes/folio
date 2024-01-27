import {uid} from "uid/secure";
import * as idb from "idb-keyval";
import {VERSION} from "@lib/constants.js";
import {migrate} from "@lib/migrate.js";

const store = idb.createStore("folio", "folio-store");

// Local client instance
export const createLocalClient = () => ({
    config: {},
    session: {},
    initialize: async () => {
        const keys = await idb.keys(store);
        // // Check if we need to migrate to multiproject
        // if (keys.length > 0 && keys.includes(LEGACY_STORE_KEYS.DATA)) {
        //     const data = await idb.get(LEGACY_STORE_KEYS.DATA, store);
        //     await idb.set("default", data, store);
        //     await idb.del(LEGACY_STORE_KEYS.DATA, store);
        //     await idb.del(LEGACY_STORE_KEYS.VERSION, store);
        // }
        // Store initialized
        return true;
    },
    list: async () => {
        const items = [];
        await store("readonly", tsx => {
            tsx.openCursor().addEventListener("success", event => {
                const cursor = event.target.result;
                if (cursor) {
                    items.push({
                        id: cursor.key,
                        title: cursor.value?.title || "untitled",
                        createdAt: cursor.value?.createdAt,
                        updatedAt: cursor.value?.updatedAt,
                    });
                    return cursor.continue();
                }
            });
            return idb.promisifyRequest(tsx.transaction);
        });
        // return items.sort((a, b) => {
        //     return b.updatedAt - a.updatedAt;
        // });
        return items;
    },
    add: (data = {}) => {
        const id = uid(16);
        return idb.set(id, data, store).then(() => id);
    },
    get: async id => {
        let data = await idb.get(id, store);
        if (!data) {
            return Promise.resolve(null);
            // return Promise.reject(new Error(`Board ${boardId} not found`));
        }
        // Check if we need to perform an upgrade to the new version
        if (data.version !== VERSION) {
            data = {
                ...data,
                ...migrate(data, data.version),
            };
            await idb.set(id, data, store);
        }
        // Return migrated data
        return data;
    },
    update: (id, data) => {
        return idb.update(id, prevData => ({...prevData, ...data}), store);
    },
    delete: id => {
        return idb.del(id, store);
    },
});
