import * as idb from "idb-keyval";
import type { Profile } from "./types.ts";
import type { UseStore } from "idb-keyval";

export default {
    name: "Folio Development",
    config: () => {
        return Promise.resolve({});
    },
    // localStorage: {
    //     dbName: "folio",
    //     storeName: "folio-store",
    //     initialize: async (store: UseStore) => {
    //         // TODO: initialize storage
    //     },
    // },
    authentication: {
        host: "/_auth",
    },
    remoteStorage: {
        host: "/_storage",
    },
} as Profile;
