import * as idb from "idb-keyval";
import type { UseStore } from "idb-keyval";
import type { ClientFactory, Entry } from "../types/client.ts";

// export const METADATA_PREFIX = "metadata:";

export type LocalOptions = {
    dbName: string;
    storeName: string;
    initialize?: (store: UseStore) => Promise<void>;
};

// get the metadata document of the given document
// const metadataKey = (id: string): string => {
//     return METADATA_PREFIX + id;
// };

export const createLocalClient: ClientFactory = (options: LocalOptions) => {
    let store: UseStore;
    let ready: Promise<void> | null = null;
    return {
        fields: {},
        // the store is initialized only once, even if connect is called more than one time
        connect: async () => {
            ready = ready || (async () => {
                store = idb.createStore(options.dbName, options.storeName);
                if (typeof options?.initialize === "function") {
                    await options.initialize(store);
                }
            })();
            return ready;
        },
        close: async () => {
            return Promise.resolve();
        },
        list: async () => {
            // 1. get all keys and filter the keys to get only the metadata ones
            const keys = (await idb.keys(store)).filter(key => {
                // return typeof key === "string" && key.startsWith(METADATA_PREFIX);
                return typeof key === "string" && !!key;
            }) as string[];
            // 2. get the metadata of all documents
            return Promise.all(keys.map(async (key): Promise<Entry> => {
                // const metadata = await idb.get(key, store);
                return {
                    id: key, // key.replace(METADATA_PREFIX, ""),
                    metadata: {}, // metadata || {},
                };
            }));
        },
        get: async (id: string) => {
            // const [value, metadata] = await Promise.all([
            //     idb.get(id, store),
            //     idb.get(metadataKey(id), store),
            // ]);
            const value = await idb.get(id, store);
            return { id: id, value: value, metadata: {} };
        },
        create: async (id: string, data: Entry) => {
            await idb.set(id, data?.value || {}, store);
            // await idb.set(metadataKey(id), data?.metadata || {}, store);
        },
        update: async (id: string, data: Entry) => {
            await idb.update(id, prevValue => ({ ...prevValue, ...data?.value }), store);
            // if (data?.metadata) {
            //     await idb.update(metadataKey(id), prevMetadata => ({ ...prevMetadata, ...data.metadata }), store);
            // }
        },
        delete: async (id: string) => {
            await idb.del(id, store);
            // await idb.del(metadataKey(id), store);
        },
    };
};
