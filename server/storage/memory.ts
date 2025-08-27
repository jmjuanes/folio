import { Collections } from "../types/storage.ts";
import type { Config } from "../config.ts";
import type { StoreContext, Document, Attributes } from "../types/storage.ts";

// create an instance of a store
export const createMemoryStore = async (config: Config): Promise<StoreContext> => {
    const storage: Document[] = [];

    // return api to access to the memory storage
    return {
        list: async (collection: Collections): Promise<Document[]> => {
            return storage.filter(document => {
                return document.collection === collection;
            });
        },
        get: async (collection: Collections, id: string): Promise<Document> => {
            return storage.find(document => {
                return document.collection === collection && document.id === id;
            });
        },
        add: async (collection: Collections, id: string, attributes?: Attributes, data?: string): Promise<void> => {
            storage.push({
                id: id,
                collection: collection,
                owner: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                attributes: attributes || {},
                data: data || "",
            });
        },
        update: async (collection: Collections, id: string, attributes?: Attributes, data?: string): Promise<void> => {
            const document = storage.find(document => {
                return document.collection === collection && document.id === id;
            });
            if (document) {
                if (typeof attributes === "object" && !!attributes) {
                    document.attributes = attributes;
                }
                if (typeof data === "string") {
                    document.data = data;
                }
                // change the updated_at date
                document.updated_at = new Date().toISOString();
            }
        },
        delete: async (collection: Collections, id: string): Promise<void> => {
            const index = storage.findIndex(document => {
                return document.id === id && document.collection === collection;
            });
            if (index > -1) {
                storage.splice(index, 1);
            }
        },
    };
};
