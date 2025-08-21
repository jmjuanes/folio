#! /usr/bin/env node

import path from "node:path";
import http from "node:http";
import { parseArgs } from "node:util";
import { getConfiguration, resolveConfigPath } from "./server/dist/config.js";
import { startServer } from "./server/dist/index.js";
import { createLogger } from "./server/dist/utils/logger.js";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = process.cwd();

// available commands
const COMMANDS = {
    START: "start",
    PING: "ping",
};

const { debug, error } = createLogger("folio:cli");

// main method to handle user commands
const main = async (command = "", options = {}) => {
    const configPath = resolveConfigPath(ROOT_PATH, options.config);
    const config = await getConfiguration(configPath);

    // 1. start the folio server
    if (command === COMMANDS.START) {
        return startServer(config);
    }
    // 2. health check
    else if (command === COMMANDS.PING) {
        const options = {
            hostname: "localhost", 
            port: parseInt(config.port || environment.FOLIO_PORT),
            path: "/_status",
            timeout: 5000,
        };
        // perform the request
        debug(`health check on ${options.hostname}:${options.port}${options.path}`);
        const request = http.request(options, response => {
            if (response.statusCode === 200) {
                return process.exit(0);
            }
            error(`health check failed with status code ${response.statusCode}`);
            process.exit(1);
        });
        // handle request errors or timeouts
        request.on("error", requestError => {
            error(`health check failed due to a request error: ${requestError.message}`);
            console.error(requestError);
            process.exit(1);
        });
        request.on("timeout", () => {
            error("health check timed out");
            process.exit(1);
        });
        request.end();
    }
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
        config: {
            type: "string",
            description: "path to the configuration file to use",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);
