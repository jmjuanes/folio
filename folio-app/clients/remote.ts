import { createApiClient } from "../lib/api.ts";
import type { StorageClient } from "../types/clients.ts";
import type { RemoteStorageConfig } from "../types/profile.ts";

// create a remote client
export const createRemoteStorageClient = (options: RemoteStorageConfig): Promise<StorageClient> =>  {
    const api = createApiClient(options.host);
    return Promise.resolve({
        list: () => {
            return api("GET", "/");
        },
        create: (data) => {
            return api("POST", "/", data);
        },
        get: (id) => {
            return api("GET", `/${id}`);
        },
        update: (id, data) => {
            return api("PATCH", `/${id}`, data);
        },
        delete: (id) => {
            return api("DELETE", `/${id}`);
        },
    } as StorageClient);
};
