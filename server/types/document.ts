// @description list of available collections
export enum Collection {
    BOARD = "board",
};

// @description main document 
export type Document = {
    collection?: Collection,
    owner?: string,
    id: string,
    created_at: string,
    updated_at: string,
    name?: string,
    attributes?: string,
    data?: string,
};

// declare document payload
// this is the accepted payload when creating or updating a document
export type DocumentPayload = {
    collection?: Collection; // collection is only required when creating a new document
    name?: string;
    attributes?: string;
    data?: string;
};

// accepted fields to filter documents
export type DocumentFilter = {
    collection?: Collection;
};
