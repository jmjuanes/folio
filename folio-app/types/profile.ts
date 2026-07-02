import type { UseStore } from "idb-keyval";

export type LocalStorageConfig = {
    dbName: string;
    storeName: string;
    initialize?: (store: UseStore) => Promise<void>;
};

export type RemoteStorageConfig = {
    host: string;
};

export type Profile = {
    name?: string;
    config?: object | (() => Promise<object>);
    services?: {
        localStorage?: LocalStorageConfig;
        remoteStorage?: RemoteStorageConfig;
    }
};
