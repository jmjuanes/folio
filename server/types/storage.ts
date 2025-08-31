import type { Collections, Document, Attributes } from "./collection.ts";

// objects store context
export type StoreContext = {
    list: (collection: Collections) => Promise<Document[]>;
    get: (collection: Collections, id: string) => Promise<Document>;
    add: (collection: Collections, id: string, attributes?: Attributes, data?: string) => Promise<void>;
    update: (collection: Collections, id: string, attributes?: Attributes, data?: string) => Promise<void>;
    delete: (collection: Collections, id: string) => Promise<void>;
};
