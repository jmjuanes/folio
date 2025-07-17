// available object types in the document store
export enum ObjectTypes {
    BOARD = "board",
    USER = "user",
    LIBRARY = "library",
};

// token type definition
export type Token = {
    user: string; // user id assigned to this token
    token: string; // the actual token string
    label: string; // label for the token or the user
    createdAt: Date; // date when the token was created
};

// document store context
export type DocumentStoreContext = {
    getObject: (objectType: ObjectTypes, id: string, includeContent?: boolean) => Promise<any>;
    getChildrenObjects: (objectType: ObjectTypes, parentId: string | null, includeContent?: boolean) => Promise<any[]>;
    insertObject: (objectType: ObjectTypes, parentId: string | null, attributes: string, content: string) => Promise<string>;
    updateObject: (objectType: ObjectTypes, id: string, attributes?: string, content?: string) => Promise<void>;
    deleteObject: (id: string, objectType: ObjectTypes) => Promise<void>;
};

// tyoken store context
export type TokenStoreContext = {
    getAllTokens: () => Promise<Token[]>;
    getToken: (user: string, token: string) => Promise<Token | null>;
    insertToken: (user: string, token: string, label: string) => Promise<void>;
    updateToken: (user: string, token: string, label: string) => Promise<void>;
    deleteToken: (user: string) => Promise<void>;
};

// each store context combines document and token store contexts
export type StoreContext = DocumentStoreContext & TokenStoreContext;
