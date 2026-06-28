export type Document = {
    name?: string;
    id?: string;
    value?: object;
    metadata?: object;
};

export type Credentials = {
    token?: string;
    username?: string;
    password?: string;
};

// general interface to access to storage
export interface StorageService {
    // documents api
    getDocuments(): Promise<Document[]>;
    getDocument(id: string): Promise<Document>;
    createDocument(data: Document): Promise<void>;
    updateDocument(id: string, data: Partial<Document>): Promise<void>;
    deleteDocument(id: string): Promise<void>;
    
    // preferences api
    getPreferences(): Promise<object>;
    updatePreferences(preferences: object): Promise<void>;
};

// local service type
export interface LocalService extends StorageService {};

// cloud service type
export interface CloudService extends StorageService {
    login(credentials: Credentials): Promise<void>;
    logout(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
};
