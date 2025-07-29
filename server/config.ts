import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { environment } from "./env.js";

export const WEB_TITLE = "folio.";

export type AccessTokenAuthConfig = {
    token?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
};

export type AuthConfig = {
    access_token?: AccessTokenAuthConfig;
};

export type LocalStorageConfig = {
    file?: string;
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

// supported environments for the website
// demo means that the website is running in a demo mode, with limited features
export enum WebsiteEnvironment {
    DEVELOPMENT = "development",
    DEMO = "demo",
    PRODUCTION = "production",
};

export type WebsiteConfig = {
    enabled?: boolean;
    directory?: string;
    index?: string;
    environment?: WebsiteEnvironment;
    title?: string;
    logo?: string;
    favicon?: string;
    hide_experimental_warning?: boolean;
};

// configuration for folio server
export type Config = {
    port?: number;
    storage?: StorageConfig;
    authentication?: AuthConfig;
    security?: SecurityConfig;
    website?: WebsiteConfig;
};

// convert a string value to a boolean
const toBoolean = (value: string|boolean, defaultValue: boolean = false): boolean => {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "yes";
    }
    return defaultValue;
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
        "storage.local.file": environment.FOLIO_STORAGE_FILE,
        "website.directory": environment.FOLIO_WEBSITE_PATH,
        "website.environment": environment.FOLIO_ENVIRONMENT,
        "website.hide_experimental_warning": toBoolean(environment.FOLIO_HIDE_EXPERIMENTAL_WARNING, false),
        "security.jwt_token_secret": environment.FOLIO_TOKEN_SECRET,
        "security.jwt_token_expiration": environment.FOLIO_TOKEN_EXPIRATION,
    };

    // iterate over the fields and set the values in the config object
    // if the field is not defined in the config object, it will be skipped
    // this allows to override only the fields that are defined in the config object
    // and to keep the default values for the fields that are not defined
    Object.keys(fields).forEach(field => {
        if (typeof fields[field] !== "undefined") {
            const keys = field.split(".");
            let current = config;

            // traverse the config object to set the value
            for (let i = 0; i < keys.length - 1; i++) {
                // if the key does not exist, skip setting the value
                if (typeof current[keys[i]] === "undefined") {
                    return;
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fields[field];
        }
    });

    return config;
};
