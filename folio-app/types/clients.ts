export type Document = {
    name?: string;
    id?: string;
    value?: object;
    metadata?: object;
};

// general interface to access to storage
export interface StorageClient {
    list(): Promise<Document[]>;
    get(id: string): Promise<Document>;
    create(data: Document): Promise<void>;
    update(id: string, data: Partial<Document>): Promise<void>;
    delete(id: string): Promise<void>;
};

