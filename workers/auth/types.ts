import type { KVAdaptor } from "folio-shared";

// interface for worker environment
export interface Env {
    ACCESS_TOKEN: string;
    ALLOWED_ORIGINS: string;
    SESSION_SECRET: string;
    SESSION_EXPIRATION: string;
    AUTHENTICATION: KVNamespace | KVAdaptor | null;
};
