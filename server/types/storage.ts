// available collections in the store
export enum Collections {
    BOARD = "board",
    LIBRARY = "library",
};

export type DocumentData = Record<string, any>;

export type Document = DocumentData & {
    _id: string,
    _collection?: string,
    _created_at: string,
    _updated_at: string,
};

// objects store context
export type StoreContext = {
    all: (collection: Collections) => Promise<Document[]>;
    get: (collection: Collections, id: string) => Promise<Document>;
    add: (collection: Collections, id: string, data: DocumentData) => Promise<void>;
    set: (collection: Collections, id: string, data: DocumentData) => Promise<void>;
    delete: (collection: Collections, id: string) => Promise<void>;
};
