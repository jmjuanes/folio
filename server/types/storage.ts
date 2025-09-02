import type { Document, DocumentPayload, DocumentFilter } from "./document.ts";

// objects store context
export type Storage = {
    all: (owner: string, filter?: DocumentFilter) => Promise<Document[]>;
    get: (owner: string, id: string) => Promise<Document>;
    add: (owner: string, id: string, payload: DocumentPayload) => Promise<void>;
    update: (owner: string, id: string, payload: DocumentPayload) => Promise<void>;
    delete: (owner: string, id: string) => Promise<void>;
};
