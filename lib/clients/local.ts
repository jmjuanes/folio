import * as idb from "idb-keyval";
import type { UseStore } from "idb-keyval";
import type { ClientFactory } from "../types/client.ts";

export type LocalOptions = {
    dbName: string;
    storeName: string;
    initialize?: (store: UseStore) => Promise<void>;
};

export const createLocalClient: ClientFactory = (options: LocalOptions) => {
    let store: UseStore;
    return {
        fields: {},
        connect: async (credentials: any) => {
            store = idb.createStore(options.dbName, options.storeName);
            if (store && typeof options?.initialize === "function") {
                await options.initialize(store);
            }
        },
        close: async () => {
            return Promise.resolve();
        },
        list: () => Promise.resolve([]),
        get: async (id: string) => {
            const result = await idb.get(id, store);
            return Promise.resolve({
                value: result,
                metadata: {},
            });
        },
        create: async (id: string, data: any) => {
            await idb.set(id, data.value, store);
            return Promise.resolve(data);
        },
        update: (id: string, data: any = {}) => {
            return idb.update(id, (prevValue) => ({ ...prevValue, ...data.value }), store);
        },
        delete: (id: string) => {
            return idb.del(id, store);
        },
    };
};
