import { createLogger } from "../utils/logger.ts";
import { createLocalStore } from "./local.ts";
import { createMemoryStore } from "./memory.ts";
import { StorageTypes } from "../config.ts";
import type { Storage } from "../types/storage.ts";
import type { Config } from "../config.ts";

const log = createLogger("folio:storage");

export const createStore = async (config: Config): Promise<Storage> => {
    let store = null;

    if (config?.storage === StorageTypes.LOCAL) {
        store = await createLocalStore(config);
    }
    else if (config?.storage === StorageTypes.MEMORY) {
        store = await createMemoryStore(config);
    }
    else {
        log.error("No valid storage method configured");
        process.exit(1);
    }

    // return the store instance
    return store;
};
