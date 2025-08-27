// @description list of available collections
export enum Collections {
    BOARD = "board",
};

// @description type for the agnostic attributes object
export type Attributes = Record<string, any>;

// @description main document 
export type Document = {
    collection?: string,
    owner?: string,
    id: string,
    created_at: string,
    updated_at: string,
    attributes?: Attributes,
    data?: string,
};
