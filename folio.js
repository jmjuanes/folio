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
    LOGIN: "login",
};

const { info, error } = createLogger("folio:cli");

// wrapper to perform http requests to the rest api
const fetch = (options = {}) => {
    const { data, ...requestOptions } = options;
    return new Promise((resolve, reject) => {
        const request = http.request(requestOptions, response => {
            if (response.statusCode === 200) {
                return resolve(response);
            }
            reject(new Error(`request failed with status code ${response.statusCode}`));
        });
        // handle request errors or timeouts
        request.on("error", requestError => {
            reject(requestError);
        });
        request.on("timeout", () => {
            reject(new Error(`request timed out`));
        });
        // send data
        if (data && typeof data === "object") {
            request.write(JSON.stringify(data));
        }
        request.end();
    });
};

// get response data
const getResponseData = response => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        response.setEncoding("utf8");
        response.on("data", chunk => {
            chunks.push(chunk);
        });
        response.on("end", () => {
            resolve(JSON.parse(chunks.join("")));
        });
        response.on("error", responseError => {
            reject(responseError);
        });
    });
};

// main method to handle user commands
const main = async (command = "", options = {}) => {
    const configPath = resolveConfigPath(ROOT_PATH, options.config);
    const config = await getConfiguration(configPath);
    const data = JSON.parse(options.data || "{}");

    // initialize base request options
    const baseRequestOptions = {
        hostname: "localhost", 
        port: parseInt(config.port),
        timeout: 5000,
        path: "/",
        headers: {
            "Content-Type": "application/json",
        },
    };

    // 1. start the folio server
    if (command === COMMANDS.START) {
        return startServer(config);
    }
    // 2. health check
    else if (command === COMMANDS.PING) {
        try {
            await fetch({
                ...baseRequestOptions,
                path: "/_status",
            });
            process.exit(0);
        } catch (responseError) {
            error(`health check failed due to a request error: ${responseError.message}`);
            console.error(responseError);
            process.exit(1);
        }
    }
    // 3. login
    else if (command === COMMANDS.LOGIN) {
        try {
            const response = await fetch({
                ...baseRequestOptions,
                path: "/_login",
                method: "POST",
                data: data,
            });
            const responseData = await getResponseData(response);
            info(`authentication: OK`);
            info(`token: '${responseData?.data?.token}'`);
            process.exit(0);
        } catch (responseError) {
            error(`login error: ${responseError.message}`);
            process.exit(1);
        }
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
        config: {
            type: "string",
            description: "path to the configuration file to use",
        },
        data: {
            type: "string",
            short: "d",
            description: "additional data for the command",
        },
        token: {
            type: "string",
            description: "token to use",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);
