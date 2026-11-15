import * as idb from "idb-keyval";
import type { Profile } from "../lib/types/profile.ts";
import type { UseStore } from "idb-keyval";

// internal utility method to rename an IDB key to another
const idbRename = async (prevKey: string, newKey: string, store: UseStore) => {
    await idb.set(newKey, (await idb.get(prevKey, store)), store);
    await idb.del(prevKey, store);
};

export default {
    name: "Folio Lite",
    config: {
        "routing.mode": "memory",
        "routing.restoreLastEditedDocument": true,
        "ui.welcome.enabled": true,
        "ui.welcome.features": [
            {
                icon: "shield-check",
                title: "Privacy First.",
                description: "Folio uses the local storage of your browser to ensure that your drawings are accessible only to you.",
            },
            {
                icon: "drawing",
                title: "Boundless Canvas.",
                description: "Unleash your imagination on an infinite canvas for sketching, prototyping, and creating.",
            },
        ],
    },
    client: {
        type: "local",
        options: {
            dbName: "folio",
            storeName: "folio-store",
            initialize: async (store: UseStore) => {
                const keys: string[] = await idb.keys(store);
                // rename all keys starting with the word 'folio:'
                if (keys.includes("folio:version")) {
                    for (const prevKey of keys) {
                        if (prevKey.startsWith("folio:")) {
                            await idbRename(prevKey, prevKey.replace("folio:", ""), store);
                        }
                    }
                    // the key version is not longer needed, so we can remove it
                    await idb.del("version", store);
                }
            },
        },
    },
} as Profile;
