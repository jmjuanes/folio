// allowed configuration
export type Config = {
    "routing.mode": "memory" | "hash";
    "routing.restoreLastEditedDocument": boolean;
    "ui.sidebar.enabled": boolean;
    "ui.welcome.enabled": boolean;
    "ui.welcome.showRecents": boolean;
    "ui.welcome.features": any[];
};

// list of configuration keys
export type ConfigKey = keyof Config;
