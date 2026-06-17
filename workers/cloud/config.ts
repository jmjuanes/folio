import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { randomBytes } from "node:crypto";
import yaml from "yaml";

// configuration for folio server
export type Config = {
    // allows to extend configuration
    extends?: string;

    // port to run folio studio. Default is 3000
    port: number | string;

    // authentication configuration
    // allowed values: 'access_token', 'local:<path>'
    authentication: string;
    access_token: string;

    // storage configuration
    // allowed values: 'local:<path>', 'memory'
    storage: string;
    atorage_file?: string; // deprecated --> mapped to storage: 'local:{storage_file}'

    // CORS configuration
    cors_allowed_origins?: string;
    cors_allowed_methods?: string;

    // Session configuration
    session_secret: string;
    session_expiration?: string;
};

// @description resolve configuration file path
export const resolveConfigPath = (currentWorkingDir: string, defaultConfigPath: string): string => {
    return resolve(currentWorkingDir, defaultConfigPath || process.env.FOLIO_CONFIG_PATH || "config/default.yaml");
};

// @description read configuration file recursive
export const readConfig = async (configPath: string, processedConfigs: any): Promise<Partial<Config>> => {
    const configStr = await readFile(resolve(configPath), "utf8");
    const config = yaml.parse(configStr) as Partial<Config>;
    // check if this configuration file extends another configuration
    if (typeof config?.extends === "string" && config?.extends) {
        const baseConfigPath = resolve(dirname(configPath), config.extends);
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

    // merge configuration from default config with configuration from env variables
    return Object.assign({}, config, {
        port: process.env.FOLIO_PORT || config.port || 3000,
        authentication: config.authentication || "access_token",
        access_token: process.env.FOLIO_ACCESS_TOKEN || config.access_token || randomBytes(32).toString("base64url"),
        storage: config.storage || "memory",
        session_secret: config.session_secret || randomBytes(32).toString("base64url"),
    });
};
