// available collections in the store
export enum Collections {
    BOARD = "board",
    USER = "user",
    LIBRARY = "library",
    ACCESS_TOKEN = "access_token",
};

// token object
export type TokenObject = {};

// objects store context
export type StoreContext = {
    get: (collection: Collections, id: string) => Promise<any>;
    cursor: (collection: Collections, callback: (error: any, row: object) => void) => Promise<void>;
    insert: (collection: Collections, content: string) => Promise<string>;
    update: (collection: Collections, id: string, content: string) => Promise<void>;
    delete: (collection: Collections, id: string) => Promise<void>;
};
