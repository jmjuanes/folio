import * as idb from "idb-keyval";
import type { Profile } from "../types/profile.ts";
import type { UseStore } from "idb-keyval";

export default {
    name: "Folio Development",
    config: () => {
        return Promise.resolve({});
    },
    services: {
        localStorage: {
            dbName: "folio",
            storeName: "folio-store",
            initialize: async (store: UseStore) => {
                // TODO: initialize storage
            },
        },
    },
} as Profile;
