import { startServer, createKV } from "folio-shared";
import worker from "./worker.ts";
import type { Config } from "folio-shared";
import type { Env } from "./types.ts";

// method to start the storage server
export const startStorageServer = async (config: Config) => {
    // 1. create environment for the worker
    const env: Env = {
        ALLOWED_ORIGINS: config.cors_allowed_origins || "*",
        SESSION_SECRET: config.session_secret,
        SESSION_EXPIRATION: config.session_expiration || "7d",
        STORAGE: (await createKV("storage", config.storage)),
    };
    // 2. create and start the storage service
    startServer("storage", Number(config.storage_port), env, worker);
};
