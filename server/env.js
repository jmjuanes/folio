import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Utility method to read the provided env
const parseEnvFile = envPath => {
    return fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath, "utf8")) : {};
};

// parse available environmets, in order of loading
const environment = {};
["production", "development", "local"].forEach(name => {
    const isCurrentEnv = process.env.NODE_ENV === name;
    const isLocalDevelopment = name === "local" && process.env.NODE_ENV === "development";
    if (isCurrentEnv || isLocalDevelopment) {
        const envPath = path.resolve(process.cwd(), `../.env.${name}`);
        Object.assign(environment, parseEnvFile(envPath));
    }
});

// parse the process.env object and get only the keys that start with "FOLIO_"
const globalEnv = Object.keys(process.env || {}).reduce((env, key) => {
    if (key.startsWith("FOLIO_")) {
        env[key] = process.env[key];
    }
    return env;
}, {});

// Export parsed env
export default {
    ...parseEnvFile(path.resolve(process.cwd(), "../.env")),
    ...globalEnv,
    ...environment,
};
