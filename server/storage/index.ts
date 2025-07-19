import { createLocalStore } from "./local.ts";
import type { StoreContext } from "../types/storage.ts";
import type { Config, StorageConfig } from "../config.ts";

export const createStore = async (config: Config): Promise<StoreContext> => {
    const storageConfig = config?.storage as StorageConfig;
    let store = null;

    if (storageConfig?.local) {
        store = await createLocalStore(config.storage.local);
    }

    // return the store instance
    return store;
};
