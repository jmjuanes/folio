import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { environment } from "./env.js";

export enum AuthenticationTypes {
    ACCESS_TOKEN = "access_token",
};

export enum StorageTypes {
    LOCAL = "local",
    MEMORY = "memory",
};

export type AccessTokenAuthConfig = {
    access_token?: string;
    user_name?: string;
    user_display_name?: string;
    user_avatar_url?: string;
};

export type LocalStorageConfig = {
    storage_file?: string;
};

export type SecurityConfig = {
    cors?: boolean;
    cors_origin?: string;
    cors_allowed_methods?: string;
    jwt_token_secret?: string;
    jwt_token_expiration?: string;
};

export type WebsiteConfig = {
    app_directory?: string;
    app_index?: string;
    app_config?: any;
};

export type BaseConfig = {
    extends?: string;
    port?: number;
    storage: StorageTypes;
    authentication: AuthenticationTypes;
};

// configuration for folio server
export type Config =
    BaseConfig &
    WebsiteConfig &
    SecurityConfig &
    LocalStorageConfig &
    AccessTokenAuthConfig;

// @description resolve configuration file path
export const resolveConfigPath = (currentWorkingDir: string, defaultConfigPath: string): string => {
    return path.resolve(currentWorkingDir, defaultConfigPath || environment.FOLIO_CONFIG_PATH || "config.yaml");
};

// @description read configuration file recursive
export const readConfig = async (configPath: string, processedConfigs: any): Promise<Config> => {
    const configStr = await fs.readFile(path.resolve(configPath), "utf8");
    const config = yaml.parse(configStr);
    // check if this configuration file extends another configuration
    if (typeof config?.extends === "string" && !!config?.extends) {
        const baseConfigPath = path.resolve(path.dirname(configPath), config.extends);
        if (!processedConfigs.has(baseConfigPath)) {
            processedConfigs.add(baseConfigPath); // prevent circular reading
            const baseConfig = await readConfig(baseConfigPath, processedConfigs);
            // extend the base configuration with the fields of the current configuration
            // config --> extends --> baseConfig
            return Object.assign(baseConfig, config);
        }
    }
    // return configuration object
    return config;
};

// read the configuration file
export const getConfiguration = async (configPath: string): Promise<Config> => {
    const config = await readConfig(configPath, new Set()) as Config;

    // get fields to override with custom environment values
    const fields = {
        "port": environment.FOLIO_PORT,
        "access_token": environment.FOLIO_ACCESS_TOKEN,
        "storage_file": environment.FOLIO_STORAGE_FILE,
        "app_directory": environment.FOLIO_APP_PATH || environment.FOLIO_WEBSITE_PATH,
        "jwt_token_secret": environment.FOLIO_TOKEN_SECRET,
        "jwt_token_expiration": environment.FOLIO_TOKEN_EXPIRATION,
    };

    // iterate over the fields and set the values in the config object
    // if the field is not defined in the config object, it will be skipped
    // this allows to override only the fields that are defined in the config object
    // and to keep the default values for the fields that are not defined
    Object.keys(fields).forEach(field => {
        if (typeof fields[field] !== "undefined") {
            config[field] = fields[field];
        }
    });

    return config;
};
