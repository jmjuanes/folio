// allowed configuration
export type Config = {
    "ui.welcome.showRecents": boolean;
    "ui.welcome.features": any[];
};

// list of configuration keys
export type ConfigKey = keyof Config;
