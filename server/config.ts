import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

export type AccessTokenAuthConfig = {
    // if not provided, a token will be automatically generated
    token?: string;
    user?: string;
};

export type AuthConfig = {
    access_token?: AccessTokenAuthConfig;
};

export type LocalStorageConfig = {
    // path to the folder where the database will be stored
    store_path?: string;
    // name of the database file. Defaults to "folio.db"
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
    // port where the server will run
    port?: number;
    // storage and authentication configuration
    storage?: StorageConfig;
    authentication?: AuthConfig;
    security?: SecurityConfig;
    website?: WebsiteConfig;
};

// @description read configuration file
export const readConfig = async (configPath: string): Promise<Config|null> => {
    if (fs.existsSync(configPath)) {
        return yaml.parse(fs.readFileSync(configPath, "utf8"));
    }
    // configuration not found
    return null;
};
