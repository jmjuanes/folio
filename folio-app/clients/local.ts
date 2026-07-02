import * as idb from "idb-keyval";
import type { UseStore } from "idb-keyval";
import type { StorageClient, Document } from "../types/clients.ts";
import type { LocalStorageConfig } from "../types/profile.ts";

export const createLocalStorageClient = async (options: LocalStorageConfig): Promise<StorageClient> => {
    // 1. create the store
    const store: UseStore = idb.createStore(options.dbName, options.storeName);
    // 2. check if we have to initialize the store
    if (store && typeof options?.initialize === "function") {
        await options.initialize(store);
    }
    // 3. return the storage client
    return Promise.resolve({
        list: () => Promise.resolve([]),
        get: async (id: string) => {
            const result = await idb.get(id, store);
            return Promise.resolve({
                value: result,
                metadata: {},
            });
        },
        create: (data: Document) => {
            return idb.set(data.id as string, data.value, store);
        },
        update: (id: string, data: Partial<Document>) => {
            return idb.update(id, (prevValue) => ({ ...prevValue, ...data.value }), store);
        },
        delete: (id: string) => {
            return idb.del(id, store);
        },
    } as StorageClient);
};
