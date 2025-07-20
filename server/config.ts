import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { environment } from "./env.js";

export type AccessTokenAuthConfig = {
    token?: string;
    user?: string;
};

export type AuthConfig = {
    access_token?: AccessTokenAuthConfig;
};

export type LocalStorageConfig = {
    store_path?: string;
    store_name?: string;
};

export type StorageConfig = {
    local?: LocalStorageConfig,
};

export type SecurityConfig = {
    cors?: boolean;
    cors_origin?: string;
    cors_allowed_methods?: string;
    jwt_token_secret?: string;
    jwt_token_expiration?: string;
};

export type WebsiteConfig = {
    enabled?: boolean;
    directory?: string;
    index?: string;
};

// configuration for folio server
export type Config = {
    port?: number;
    storage?: StorageConfig;
    authentication?: AuthConfig;
    security?: SecurityConfig;
    website?: WebsiteConfig;
};

// @description resolve configuration file path
export const resolveConfigPath = (currentWorkingDir: string, defaultConfigPath: string): string => {
    return path.resolve(currentWorkingDir, defaultConfigPath || environment.FOLIO_CONFIG_PATH || "config.yaml");
};

// @description read configuration file
export const readConfig = async (configPath: string): Promise<Config> => {
    const content = await fs.readFile(path.resolve(configPath), "utf8");
    return yaml.parse(content);
};

// read the configuration file
export const getConfiguration = async (configPath: string): Promise<Config> => {
    const config = await readConfig(configPath) as Config;

    // get fields to override with custom environment values
    const fields = {
        "port": environment.FOLIO_PORT,
        "authentication.access_token.token": environment.FOLIO_ACCESS_TOKEN,
        "storage.local.storage_path": environment.FOLIO_STORAGE_PATH,
        "storage.local.storage_name": environment.FOLIO_STORAGE_NAME,
        "website.directory": environment.FOLIO_WEBSITE_PATH,
        "security.jwt_token_secret": environment.FOLIO_TOKEN_SECRET,
        "security.jwt_token_expiration": environment.FOLIO_TOKEN_EXPIRATION,
    };

    Object.keys(fields)
        .filter(field => typeof fields[field] === "string" && !!fields[field])
        .forEach(field => {
            const keys = field.split(".");
            let current = config;

            // traverse the config object to set the value
            for (let i = 0; i < keys.length - 1; i++) {
                // if the key does not exist, skip setting the value
                if (!current[keys[i]]) {
                    return;
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fields[field];
        });

    return config;
};
