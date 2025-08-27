// available collections in the store
export enum Collections {
    BOARD = "board",
};

export type Attributes = Record<string, any>;

export type Document = {
    collection?: string,
    owner: string,
    id: string,
    created_at: string,
    updated_at: string,
    attributes: Attributes,
    data?: string,
};

// objects store context
export type StoreContext = {
    list: (collection: Collections) => Promise<Document[]>;
    get: (collection: Collections, id: string) => Promise<Document>;
    add: (collection: Collections, id: string, attributes?: Attributes, data?: string) => Promise<void>;
    update: (collection: Collections, id: string, attributes?: Attributes, data?: DocumentData) => Promise<void>;
    delete: (collection: Collections, id: string) => Promise<void>;
};
