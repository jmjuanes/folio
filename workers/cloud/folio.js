#! /usr/bin/env node

import path from "node:path";
import http from "node:http";
import { parseArgs } from "node:util";
import { getConfiguration, resolveConfigPath } from "./lib/config.js";
import { startServer } from "./lib/index.js";
import { createLogger } from "./lib/logger.js";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = process.cwd();

const COMMANDS = {
    START: "start",
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

    // 1. start the folio server services
    if (command === COMMANDS.START) {
        // NOTE: make sure that we use the correct port for folio server
        // using the --port argument takes preference over the port in configuration
        startServer(Object.assign(config, {
            port: options.port || config.port,
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
