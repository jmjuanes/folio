// base document fields
export type DocumentBase = {
    id: string,
    created_at: string,
    updated_at: string,
};

// @description main document 
export type Document = DocumentBase & {
    attributes: any,
    data: any,
};

// document with only attributes
export type DocumentWithAttributes = DocumentBase & {
    attributes: any;
};

// document with only data
export type DocumentWithData = DocumentBase & {
    data: any;
};
