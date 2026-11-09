import * as idb from "idb-keyval";
import type { Profile } from "../lib/types/profile.ts";
import type { UseStore } from "idb-keyval";

export default {
    name: "Folio Development",
    config: () => {
        return Promise.resolve({});
    },
    clients: [
        {
            id: "remote",
            type: "keyval",
            label: "Persistent",
            options: {
                authenticationHost: "/_auth",
                storageHost: "/_storage",
            },
        }
    ],
    // localStorage: {
    //     dbName: "folio",
    //     storeName: "folio-store",
    //     initialize: async (store: UseStore) => {
    //         // TODO: initialize storage
    //     },
    // },
} as Profile;
