import type { UseStore } from "idb-keyval";

export type LocalServiceProfile = {
    dbName: string;
    storeName: string;
    initialize: (store: UseStore) => Promise<void>;
};

export type Profile = {
    name?: string;
    config?: object | (() => Promise<object>);
    services?: {
        local?: null | LocalServiceProfile;
    }
};
