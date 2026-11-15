import type { ClientFactory, Entry } from "../types/client.ts";

export type MemoryOptions = {};

export const createMemoryClient: ClientFactory = (options: MemoryOptions) => {
    const storage: any[] = [];
    return {
        fields: {},
        connect: async () => {
            return Promise.resolve();
        },
        close: async () => {
            return Promise.resolve();
        },
        list: async () => {
            return storage.map((item: any) => {
                return {
                    id: item.id,
                    metadata: item.metadata || {},
                };
            });
        },
        get: async (id: string) => {
            return storage.find((item: any) => {
                return item.id === id;
            });
        },
        create: async (id: string, data: Entry) => {
            storage.push({
                id: id,
                value: data.value || {},
                metadata: data.metadata || {},
            });
        },
        update: async (id: string, data: Entry) => {
            const item = storage.find(item => item.id === id);
            if (item) {
                Object.assign(item.value, data.value || {});
                Object.assign(item.metadata, data.metadata || {});
            }
        },
        delete: async (id: string) => {
            const index = storage.findIndex(item => item.id === id);
            if (index) {
                storage.splice(index, 1);
            }
        },
    };
};
