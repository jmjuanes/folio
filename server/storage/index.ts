import { createLogger } from "../utils/logger.ts";
import { createLocalStore } from "./local.ts";
import { StorageTypes } from "../config.ts";
import type { StoreContext } from "../types/storage.ts";
import type { Config } from "../config.ts";

const { debug, error } = createLogger("folio:storage");

export const createStore = async (config: Config): Promise<StoreContext> => {
    let store = null;

    if (config?.storage === StorageTypes.LOCAL) {
        store = await createLocalStore(config);
    }
    else {
        error("No valid storage method configured");
        process.exit(1);
    }

    // return the store instance
    return store;
};
