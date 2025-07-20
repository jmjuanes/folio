#! /usr/bin/env node

import path from "node:path";
import { parseArgs } from "node:util";
import { environment } from "./server/dist/env.js";
import { readConfig } from "./server/dist/config.js";
import { startServer } from "./server/dist/index.js";
import { createLogger } from "./server/dist/utils/logger.js";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = process.cwd();

// read the configuration file
const getConfiguration = async (configPath) => {
    const config = await readConfig(path.resolve(ROOT_PATH, configPath));

    // get fields to override with custom environment values
    const fields = {
        "port": environment.FOLIO_PORT,
        "authentication.access_token.token": environment.FOLIO_ACCESS_TOKEN,
        "storage.local.storage_path": environment.FOLIO_STORAGE_PATH,
        "storage.local.storage_name": environment.FOLIO_STORAGE_NAME,
        "website.directory": environment.FOLIO_WEBSITE_PATH,
        "security.jwt_token_secret": environment.FOLIO_TOKEN_SECRET,
        "security.jwt_token_expiration": environment.FOLIO_TOKEN_EXPIRATION,
    };

    Object.keys(fields)
        .filter(field => typeof fields[field] === "string" && !!fields[field])
        .forEach(field => {
            const keys = field.split(".");
            let current = config;

            // traverse the config object to set the value
            for (let i = 0; i < keys.length - 1; i++) {
                // if the key does not exist, skip setting the value
                if (!current[keys[i]]) {
                    return;
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fields[field];
        });

    return config;
};

// main method to handle user commands
const main = async (command = "", options = {}) => {
    const { debug, error } = createLogger("folio:cli");
    const config = await getConfiguration(options.config || environment.FOLIO_CONFIG_PATH || "config.yaml");

    // 1. start the folio server
    if (command === "start") {
        return startServer(config);
    }
    else {
        error("Unknown command.");
        process.exit(1);
    }
};

// parse command line arguments
const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        config: {
            type: "string",
            description: "path to the configuration file to use",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);
