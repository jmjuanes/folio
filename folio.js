#! /usr/bin/env node

import path from "node:path";
import { parseArgs } from "node:util";
import { environment } from "./server/dist/env.js";
import { startServer } from "./server/dist/index.js";
import { createLocalStore } from "./server/dist/storage/local.js";
import { generateToken } from "./server/dist/token.js";
import { ObjectTypes } from "./server/dist/types/storage.js";

// this is the root path of the project
// it is used to resolve paths to the data and www directories
const ROOT_PATH = process.cwd();

const printUserInfo = (userId, token = "", attributes = null) => {
    console.log(`${userId} {`);
    console.log(`    token: '${token}'`);
    if (attributes) {
        console.log(`    attributes: {`);
        Object.keys(attributes).forEach(key => {
            console.log(`        ${key}: '${attributes[key]}'`);
        });
        console.log(`    }`);
    }
    console.log(`}`);
};

const printHelp = () => {
    console.log("Usage: node folio.js <command> [options]");
    console.log("Commands:");
    console.log("  start              Start the FOLIO server.");
    console.log("  users:create       Create a new user with specified attributes.");
    console.log("  users:updateToken  Update the token for a specified user.");
    console.log("  users:list         List all users.");
    console.log("Options:");
    console.log("  --user <name>  Specify the user ID for user-related actions.");
    console.log("  --userName <name> Specify the name of the user to create.");
    console.log("  --userEmail <email> Specify the email of the user to create.");
};

// main method to handle user commands
const main = async (command = "", options = {}) => {
    const config = {
        // server configuration
        port: environment.FOLIO_PORT ? parseInt(environment.FOLIO_PORT) : 8080,

        // paths to the server directories
        wwwPath: path.resolve(ROOT_PATH, environment.FOLIO_WWW_PATH || "./www"),

        // storage configuration
        storage: {
            storePath: path.resolve(ROOT_PATH, environment.FOLIO_STORAGE_PATH || "./data"),
            storeName: environment.FOLIO_STORE_NAME || "folio.db",
        },

        // token configuration
        tokenExpiration: environment.FOLIO_TOKEN_EXPIRATION,
        tokenSecret: environment.FOLIO_TOKEN_SECRET,
    };

    // 1. start the folio server
    if (command === "start") {
        return startServer(config);
    }
    // 2. handle user commands
    else if (command.startsWith("users:")) {
        const store = await createLocalStore(config);

        if (command === "users:create") {
            const userAttributes = {
                name: options.userName,
                email: options.userEmail,
            };
            const userId = await store.insertObject(ObjectTypes.USER, "ROOT", JSON.stringify(userAttributes), "");
            const userToken = generateToken(20);
            await store.insertToken(userId, userToken, options.label || "");

            // Output the created user information
            printUserInfo(userId, userToken, userAttributes);
        }
        else if (command === "users:list") {
            const users = await store.getChildrenObjects(ObjectTypes.USER, "ROOT");
            users.forEach(user => {
                printUserInfo(user.id, "************", JSON.parse(user.attributes || "{}"));
            });
        }
        else if (command === "users:updateToken") {
            if (!options.user) {
                console.error("Error: --user option is required to update a user's token.");
                return;
            }
            const user = await store.getObject(ObjectTypes.USER, options.user);
            if (!user) {
                console.error(`Error: User with ID '${options.user}' not found.`);
                return;
            }
            const newToken = generateToken(20);
            await store.updateToken(user.id, newToken);
            
            // Output the updated user information
            printUserInfo(user.id, newToken, JSON.parse(user.attributes || "{}"));
        }
        else if (command === "users:delete") {
            if (!options.user) {
                console.error("Error: --user option is required to delete a user.");
                return;
            }
            const userId = options.user;
            await store.deleteObject(ObjectTypes.USER, userId);
            await store.deleteToken(userId);
            console.log(`User with ID '${userId}' has been deleted.`);
        }
        else {
            console.error(`Error: Command '${command}' not recognized.`);
        }
    }
    // 3. command not recognized
    else {
        printHelp();
    }
};

// parse command line arguments
const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        user: {
            type: "string",
            description: "User ID of the user to query or update",
        },
        userName: {
            type: "string",
            description: "Name of the user to create",
        },
        userEmail: {
            type: "string",
            description: "Email of the user to create",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);
