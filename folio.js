#! /usr/bin/env node

import path from "node:path";
import http from "node:http";
import { parseArgs } from "node:util";
import { getConfiguration, resolveConfigPath, createLogger } from "#folio-shared";
import { startAuthServer } from "#folio-auth";
import { startStorageServer } from "#folio-storage";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = process.cwd();

const COMMANDS = {
    START_AUTH: "start:auth",
    START_STORAGE: "start:storage",
};

const { info, error } = createLogger("folio:cli");

// wrapper to perform http requests to the rest api
// const fetch = (options = {}) => {
//     const { data, ...requestOptions } = options;
//     return new Promise((resolve, reject) => {
//         const request = http.request(requestOptions, response => {
//             if (response.statusCode === 200) {
//                 return resolve(response);
//             }
//             reject(new Error(`request failed with status code ${response.statusCode}`));
//         });
//         // handle request errors or timeouts
//         request.on("error", requestError => {
//             reject(requestError);
//         });
//         request.on("timeout", () => {
//             reject(new Error(`request timed out`));
//         });
//         // send data
//         if (data && typeof data === "object") {
//             request.write(JSON.stringify(data));
//         }
//         request.end();
//     });
// };

// main method to handle user commands
const main = async (command = "", options = {}) => {
    const configPath = resolveConfigPath(ROOT_PATH, options.config || "");
    const config = await getConfiguration(configPath);

    // 1. start the folio auth service
    if (command === COMMANDS.START_AUTH) {
        // NOTE: make sure that we use the correct port for folio server
        // using the --port argument takes preference over the port in configuration
        startAuthServer(Object.assign(config, {
            authentication_port: options.port || config.authentication_port,
        }));
    }
    // 2. start the storage service
    else if (command === COMMANDS.START_STORAGE) {
        startStorageServer(Object.assign(config, {
            storage_port: options.port || config.storage_port,
        }));
    }
    // unknown command
    else {
        const commandsList = Object.values(COMMANDS).join(", ");
        error(`unknown command '${command}'. Available commands: ${commandsList}.`);
        process.exit(1);
    }
};

// parse command line arguments
const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        // general options (works for all commands)
        config: {
            type: "string",
            description: "path to the configuration file to use",
        },
        // start command options
        port: {
            type: "string",
            description: "port to use",
            short: "p",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);
