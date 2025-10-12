import { Collection } from "../types/document.ts";
import type { Config } from "../config.ts";
import type { Document, DocumentFilter, DocumentPayload } from "../types/document.ts";
import type { Storage } from "../types/storage.ts";

// create an instance of a store
export const createMemoryStore = async (config: Config): Promise<Storage> => {
    const storage: Document[] = [];

    // return api to access to the memory storage
    return {
        queryDocuments: async (owner: string, filter: DocumentFilter): Promise<Document[]> => {
            return storage.filter(document => {
                if (document.owner !== owner) {
                    return false;
                }
                // validate filters
                if (filter && Object.keys(filter).length > 0) {
                    return Object.keys(filter || {}).every(key => {
                        return document[key] === filter[key];
                    });
                }
                return true; // no filter, return all documents for the owner
            });
        },
        getDocument: async (owner: string, id: string): Promise<Document> => {
            return storage.find(document => {
                return document.owner === owner && document.id === id;
            });
        },
        addDocument: async (owner: string, id: string, payload: DocumentPayload): Promise<void> => {
            storage.push({
                id: id,
                collection: payload.collection as Collection,
                owner: owner,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                name: payload.name || "Untitled",
                attributes: payload.attributes || "",
                data: payload.data || "",
            });
        },
        updateDocument: async (owner: string, id: string, payload: DocumentPayload): Promise<void> => {
            const document = storage.find(document => {
                return document.owner === owner && document.id === id;
            });
            if (document && payload) {
                [ "name", "attributes", "data" ].forEach(field => {
                    if (typeof payload[field] === "string") {
                        document[field] = payload[field];
                    }
                });
                // change the updated_at date
                document.updated_at = new Date().toISOString();
            }
        },
        deleteDocument: async (owner: string, id: string): Promise<void> => {
            const index = storage.findIndex(document => {
                return document.id === id && document.owner === owner;
            });
            if (index > -1) {
                storage.splice(index, 1);
            }
        },
    };
};
