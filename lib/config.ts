import profile from "@profile";
import type { Config, ConfigKey } from "./types/config.ts";

export const defaultConfig: Config = {
    "ui.welcome.showRecents": true,
    "ui.welcome.features": [],
};

// create the full configuration object
export const createConfig = (overrides: Partial<Config>): Config => {
    return Object.assign({}, defaultConfig, overrides || {})
};

// create the global configuration of the application
// it will merge the configuration in profile with the default config
const config = createConfig(profile?.config as Partial<Config>);

// get a configuration value
export const getConfig = <K extends ConfigKey>(key: K): Config[K] => {
    return config[key];
};
