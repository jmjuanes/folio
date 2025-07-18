import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

export type Environment = Record<string, string | undefined>;

enum NodeEnv {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
};

// check if the node environment is set to development or production
// export const IS_PROD = environment.NODE_ENV === "production";
export const isProd = (): boolean => {
    return process.env.NODE_ENV === "production";
};

// utility method to read the provided env
const readFileEnv = (envFile: string, mode?: NodeEnv): Environment => {
    const envPath = path.join(process.cwd(), envFile);
    if (!mode || process.env.NODE_ENV === mode) {
        return fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath, "utf8")) : {};
    }
    return {};
};

// read global environment variables from process.env
const readGlobalEnv = (): Environment => {
    return Object.keys(process.env || {}).reduce((env, key) => {
        if (key.startsWith("FOLIO_")) {
            env[key] = process.env[key];
        }
        return env;
    }, {});
};

// export parsed env
export const environment: Environment = {
    ...readFileEnv(".env"),
    ...readGlobalEnv(),
    ...readFileEnv(".env.production", NodeEnv.PRODUCTION),
    ...readFileEnv(".env.development", NodeEnv.DEVELOPMENT),
    ...readFileEnv(".env.local", NodeEnv.DEVELOPMENT),
};
