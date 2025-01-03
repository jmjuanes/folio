import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Utility method to read the provided env
const parseEnvFile = envPath => {
    return fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath, "utf8")) : {};
};

// Parse available environmets, in order of loading
const environment = {};
// const environments = ["production", "development"];
const environments = ["production", "development", "local"];

environments.forEach(name => {
    const isCurrentEnv = process.env.NODE_ENV === name;
    const isLocalDevelopment = name === "local" && process.env.NODE_ENV === "development";
    if (isCurrentEnv || isLocalDevelopment) {
        const envPath = path.resolve(process.cwd(), `.env.${name}`);
        Object.assign(environment, parseEnvFile(envPath));
    }
});

// Export parsed env
export default {
    ...parseEnvFile(path.resolve(process.cwd(), ".env")),
    ...environment,
};
