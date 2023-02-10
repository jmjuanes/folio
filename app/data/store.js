import * as idb from "idb-keyval";
import {VERSION} from "folio-core";

const DB_NAME = "folio";
const STORE_NAME = "folio-store";

export const getStore = () => {
    const store = idb.createStore(DB_NAME, STORE_NAME);
    return {
        store: store,
        async init() {
            if ((await idb.keys(store)).length === 0) {
                await idb.set("version", VERSION, store);
            }
            return true;
        },
        async get() {
            return idb.get("state", store);
        },
        async set(newState) {
            return idb.set("state", newState, store);
        },
    };
};

