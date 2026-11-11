import * as idb from "idb-keyval";
import type { UseStore } from "idb-keyval";
import type { ClientFactory, Entry } from "../types/client.ts";

export type LocalOptions = {
    dbName: string;
    storeName: string;
    initialize?: (store: UseStore) => Promise<void>;
};

const PREFERENCES_ID = "preferences";
const BOARD_PREFIX = "board:";
const METADATA_PREFIX = "metadata:";

// documents are saved in the key 'board:<id>' (the board saved by Folio Lite is the id 'default')
// and their metadata in a separate key, so the value of a document keeps the same format as always.
// The preferences are saved in the key 'preferences'
const valueKey = (id: string): string => {
    return id === PREFERENCES_ID ? id : BOARD_PREFIX + id;
};

const metadataKey = (id: string): string => {
    return METADATA_PREFIX + id;
};

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
            const keys = (await idb.keys(store)).filter(key => {
                return typeof key === "string" && key.startsWith(BOARD_PREFIX);
            }) as string[];
            return Promise.all(keys.map(async (key): Promise<Entry> => {
                const id = key.slice(BOARD_PREFIX.length);
                const metadata = await idb.get(metadataKey(id), store);
                if (metadata) {
                    return { id: id, metadata: metadata };
                }
                // boards saved by previous versions do not have metadata, get the name from the board title
                const value = await idb.get(key, store);
                return { id: id, metadata: { name: value?.title || "Untitled" } };
            }));
        },
        get: async (id: string) => {
            const [value, metadata] = await Promise.all([
                idb.get(valueKey(id), store),
                idb.get(metadataKey(id), store),
            ]);
            return { id: id, value: value, metadata: metadata || {} };
        },
        create: async (id: string, data: Entry) => {
            await idb.set(valueKey(id), data?.value || {}, store);
            await idb.set(metadataKey(id), data?.metadata || {}, store);
        },
        update: async (id: string, data: Entry) => {
            await idb.update(valueKey(id), prevValue => ({ ...prevValue, ...data?.value }), store);
            if (data?.metadata) {
                await idb.update(metadataKey(id), prevMetadata => ({ ...prevMetadata, ...data.metadata }), store);
            }
        },
        delete: async (id: string) => {
            await idb.del(valueKey(id), store);
            await idb.del(metadataKey(id), store);
        },
    };
};
