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
    thumbnail?: string,
    data?: string,
};
