export type KVAdaptorPutOptions = {
    metadata?: any;
};

export type KVAdaptorListOptions = {
    prefix?: string;
};

export type KVAdaptorListResponse = {
    keys: {
        name: string;
        metadata: any;
    }[];
};

export type KVAdaptor = {
    get: (key: string, type?: string) => Promise<string | object | null>;
    getWithMetadata: (key: string, type?: string) => Promise<{ value: string | object | null, metadata: object | null }>;
    put: (key: string, value: string, options?: KVAdaptorPutOptions) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list: (options?: KVAdaptorListOptions) => Promise<KVAdaptorListResponse>;
};

// interface for worker environment
export interface Env {
    ACCESS_TOKEN: string;
    ALLOWED_ORIGINS: string;
    SESSION_SECRET: string;
    SESSION_EXPIRATION: string;
    AUTHENTICATION: KVNamespace | KVAdaptor | null;
    STORAGE: KVNamespace | KVAdaptor;
};
