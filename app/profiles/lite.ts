import * as idb from "idb-keyval";
import type { Profile } from "../types/profile.ts";
import type { UseStore } from "idb-keyval";

// internal utility method to rename an IDB key to another
const idbRename = async (prevKey: string, newKey: string, store: UseStore) => {
    await idb.set(newKey, (await idb.get(prevKey, store)), store);
    await idb.del(prevKey, store);
};

export default {
    name: "Folio Lite",
    config: () => {
        return Promise.resolve({});
    },
    services: {
        local: {
            dbName: "folio",
            storeName: "folio-store",
            initialize: async (store: UseStore) => {
                const keys: string[] = await idb.keys(store);
                if (keys.includes("folio:version")) {
                    // 1. rename all keys starting with the word 'folio:'
                    for (const prevKey of keys) {
                        if (prevKey.startsWith("folio:")) {
                            await idbRename(prevKey, prevKey.replace("folio:", ""), store);
                        }
                    }
                    // 2. check if we have to rename 'data' to 'board:default'
                    if (keys.includes("folio:data")) {
                        await idbRename("data", "board:default", store);
                    }
                    // 3. remove unused keys
                    await idb.del("folio:version", store);
                }
            },
        },
    },
} as Profile;
