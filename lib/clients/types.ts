export type Credentials = {
    token?: string;
};

export type StorageDocument = {
    name?: string;
    id?: string;
    value?: any;
    metadata?: any;
};

export type AuthenticatedUser = {
    username: string;
};

export interface StorageClient {
    list(): Promise<StorageDocument[]>;
    get(id: string): Promise<StorageDocument>;
    create(data: StorageDocument): Promise<void>;
    update(id: string, data: Partial<StorageDocument>): Promise<void>;
    delete(id: string): Promise<void>;
};

export interface AuthenticationClient {
    login(credentials: Credentials): Promise<void>;
    logout(): Promise<void>;
    getAuthenticatedUser(): Promise<AuthenticatedUser>;
};
