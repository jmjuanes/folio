import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";

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

// @description read configuration file
export const readConfig = async (configPath: string): Promise<Config> => {
    const content = await fs.readFile(path.resolve(configPath), "utf8");
    return yaml.parse(content);
};
