export type DatabaseOptions = {};

export type DatabaseManager = {
    insertObject: (object: string, parent: string, attributes: string, content: string) => Promise<string>;
    getObject: (object: string, id: string, includeContent?: boolean) => Promise<object>;
    updateObject: (object: string, id: string, attributes?: string, content?: string) => Promise<void>;
    deleteObject: (id: string, object?: string) => Promise<void>;
    getChildrenObjects: (object: string, parentId: string, includeContent?: boolean) => Promise<object[]>;
};
