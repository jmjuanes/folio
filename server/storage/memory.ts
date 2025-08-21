import { Collections } from "../types/storage.ts";
import type { Config } from "../config.ts";
import type { StoreContext, Document, DocumentData } from "../types/storage.ts";

// create an instance of a store
export const createMemoryStore = async (config: Config): Promise<StoreContext> => {
    const storage: Document[] = [];

    // return api to access to the memory storage
    return {
        all: async (collection: Collections): Promise<Document[]> => {
            return storage.filter(document => {
                return document._collection === collection;
            });
        },
        get: async (collection: Collections, id: string): Promise<Document> => {
            return storage.find(document => {
                return document._collection === collection && document._id === id;
            });
        },
        add: async (collection: Collections, id: string, data: DocumentData = {}): Promise<void> => {
            storage.push({
                _id: id,
                _collection: collection,
                _created_at: new Date().toISOString(),
                _updated_at: new Date().toISOString(),
                ...data,
            });
        },
        set: async (collection: Collections, id: string, data: DocumentData = {}): Promise<void> => {
            const document = storage.find(document => {
                return document._collection === collection && document._id === id;
            });
            if (document) {
                Object.assign(document, data);
                document._updated_at = new Date().toISOString();
            }
        },
        delete: async (collection: Collections, id: string): Promise<void> => {
            const index = storage.findIndex(document => {
                return document._id === id && document._collection === collection;
            });
            if (index > -1) {
                storage.splice(index, 1);
            }
        },
    };
};
