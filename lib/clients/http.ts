import { createApiClient } from "../api.ts";
import type { ClientFactory } from "../types/client.ts";

export type HttpOptions = {
    // base path of the storage API, served by the same server than the editor
    host?: string;
};

// client for the Folio server: no authentication, so it does not request any field
export const createHttpClient: ClientFactory = (options: HttpOptions) => {
    const api = createApiClient(options?.host || "/api");
    return {
        fields: {},
        connect: async () => {
            // check that the server is reachable
            await api("GET", "/status");
        },
        close: async () => {
            return Promise.resolve();
        },
        list: () => {
            return api("GET", "/");
        },
        get: (id: string) => {
            return api("GET", `/${encodeURIComponent(id)}`);
        },
        create: (id: string, data: any) => {
            return api("POST", "/", { ...data, id: id });
        },
        update: (id: string, data: any) => {
            return api("PATCH", `/${encodeURIComponent(id)}`, data);
        },
        delete: (id: string) => {
            return api("DELETE", `/${encodeURIComponent(id)}`);
        },
    };
};
