import type { Document, DocumentPayload, DocumentFilter } from "./document.ts";

// objects store context
export type Storage = {
    queryDocuments: (owner: string, filter?: DocumentFilter) => Promise<Document[]>;
    getDocument: (owner: string, id: string) => Promise<Document>;
    addDocument: (owner: string, id: string, payload: DocumentPayload) => Promise<void>;
    updateDocument: (owner: string, id: string, payload: DocumentPayload) => Promise<void>;
    deleteDocument: (owner: string, id: string) => Promise<void>;
};
