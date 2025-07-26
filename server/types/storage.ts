// available collections in the store
export enum Collections {
    BOARD = "board",
    LIBRARY = "library",
};

// objects store context
export type StoreContext = {
    get: (collection: Collections, id: string) => Promise<any>;
    cursor: (collection: Collections, callback: (error: any, row: object) => void) => Promise<void>;
    add: (collection: Collections, id: string, parent: string, attributes: any, content: string) => Promise<void>;
    set: (collection: Collections, id: string, parent: string, attributes: any, content: string) => Promise<void>;
    delete: (collection: Collections, id: string, parent: string) => Promise<void>;
};
