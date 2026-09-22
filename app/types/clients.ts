export type Credentials = {
    token?: string;
};

export type Document = {
    name?: string;
    id?: string;
    value?: object;
    metadata?: object;
};

export interface StorageClient {
    list(): Promise<Document[]>;
    get(id: string): Promise<Document>;
    create(data: Document): Promise<void>;
    update(id: string, data: Partial<Document>): Promise<void>;
    delete(id: string): Promise<void>;
};

export interface AuthenticationClient {
    login(credentials: Credentials): Promise<void>;
    logout(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
};
