import type { KVAdaptor } from "folio-shared";

// interface for worker environment
export interface Env {
    ALLOWED_ORIGINS: string;
    SESSION_SECRET: string;
    SESSION_EXPIRATION: string;
    STORAGE: KVNamespace | KVAdaptor;
};
