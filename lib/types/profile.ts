import type { Config } from "./config.ts";

export type Profile = {
    name?: string;
    config: Partial<Config>;
    client: {
        type: "http" | "local" | "memory";
        options?: Record<string, any>;
    };
};
