import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { uid } from "uid/secure";
import { ObjectTypes } from "../types/storage.ts";
import type { Config } from "../types/config.ts";
import type { Token, StoreContext} from "../types/storage.ts";

const DB_NAME = "folio.db";
const DOCUMENTS_TABLE_NAME = "documents";
const TOKENS_TABLE_NAME = "tokens";

// get fields to query the database
const getFields = (includeContent: boolean = false): string => {
    const fields = [
        "id",
        "object",
        "parent",
        "created_at",
        "updated_at",
        "attributes"
    ];
    if (includeContent) {
        fields.push("content");
    }
    return fields.join(", ");
};

// create an instance of a store
export const createLocalStore = async (config: Config): Promise<StoreContext> => {
    const storePath = path.resolve(config.dataPath);
        console.log(storePath);

    // 1. ensure the database directory exists
    if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
    }

    // 2. open the SQLite database
    const db = await open({
        filename: path.join(storePath, config.store?.databaseName || DB_NAME),
        driver: sqlite3.Database
    });

    // 3. create store table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${DOCUMENTS_TABLE_NAME} (
            id TEXT NOT NULL,
            object TEXT NOT NULL,
            parent TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            attributes TEXT,
            content TEXT,
            PRIMARY KEY (id)
        );
        CREATE TABLE IF NOT EXISTS ${TOKENS_TABLE_NAME} (
            user TEXT NOT NULL,
            token TEXT NOT NULL,
            label TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user)
        );
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE_NAME}_id ON ${DOCUMENTS_TABLE_NAME} (id);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE_NAME}_id_object ON ${DOCUMENTS_TABLE_NAME} (id, object);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE_NAME}_parent ON ${DOCUMENTS_TABLE_NAME} (parent);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE_NAME}_parent_object ON ${DOCUMENTS_TABLE_NAME} (parent, object);
        CREATE INDEX IF NOT EXISTS idx_${TOKENS_TABLE_NAME}_user_token ON ${TOKENS_TABLE_NAME} (user, token);
    `);

    // verify that the table has a record for the user object
    // if the root user object does not exist, create it
    // const userExists = await db.get(`SELECT COUNT(*) as count FROM ${DOCUMENTS_TABLE_NAME} WHERE object = ?`, [ObjectTypes.USER]);
    // if (userExists.count === 0) {
    //     await db.run(
    //         `INSERT INTO ${DOCUMENTS_TABLE_NAME} (id, object, attributes, content) VALUES (?, ?, ?, ?)`,
    //         [uid(20), ObjectTypes.USER, "{}", "{}"],
    //     );
    // }

    // return api to access to the database
    return {
        // @description insert a new object into the database
        // @param {string} object - The type of object to insert
        // @param {string} parent - The parent ID of the object
        // @param {string} attributes - Additional attributes of the object
        // @param {string} content - The content of the object
        // @returns {Promise<string>} - The ID of the inserted object
        insertObject: async (object: ObjectTypes, parent: string, attributes: string, content: string): Promise<string> => {
            const id = uid(20); // generate a unique ID for the object
            await db.run(
                `INSERT INTO ${DOCUMENTS_TABLE_NAME} (id, object, parent, attributes, content) VALUES (?, ?, ?, ?, ?)`,
                [id, object, parent || null, attributes || "{}", content || ""],
            );
            return id; // return the ID of the inserted object
        },

        // @description get an object by its ID and type
        // @param {string} object - The type of object to retrieve
        // @param {string} id - The ID of the object to retrieve
        // @param {boolean} includeContent - Whether to include content in the result. Defaults to true.
        // @returns {Promise<Object>} - The object that matches the ID and type, or null if not found
        getObject: async (object: ObjectTypes, id?: string, includeContent?: boolean): Promise<object> => {
            return await db.get(
                `SELECT ${getFields(includeContent ?? true)} FROM ${DOCUMENTS_TABLE_NAME} WHERE id = ? AND object = ?`,
                [id, object],
            );
        },

        // @description update an existing object in the database
        // @param {string} object - The type of object to update
        // @param {string} id - The ID of the object to update
        // @param {string} attributes - The new attributes for the object
        // @param {string} content - The new content for the object
        // @returns {Promise<void>} - Resolves when the update is complete
        updateObject: async (object: ObjectTypes, id: string, attributes: string = null, content: string = null): Promise<void> => {
            if (typeof attributes === "string") {
                await db.run(
                    `UPDATE ${DOCUMENTS_TABLE_NAME} SET attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
                    [attributes || "{}", id, object],
                );
            }
            if (typeof content === "string") {
                await db.run(
                    `UPDATE ${DOCUMENTS_TABLE_NAME} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
                    [content || "", id, object],
                );
            }
        },

        // @description delete an object from the database
        // @param {string} id - The ID of the object to delete
        // @param {string} object - The type of object to delete
        // @returns {Promise<void>} - Resolves when the deletion is complete
        deleteObject: async (object: ObjectTypes, id: string): Promise<void> => {
            // 1. delete the object itself
            await db.run(
                `DELETE FROM ${DOCUMENTS_TABLE_NAME} WHERE id = ? AND object = ?`,
                [id, object],
            );
            // 2. remove all children of the object
            await db.run(`DELETE FROM ${DOCUMENTS_TABLE_NAME} WHERE parent = ?`, [id]);
        },

        // @description get children of a given parent object
        // @param {string} object - The type of object to search for
        // @param {string} parent - The parent ID to search for
        // @param {boolean} includeContent - Whether to include content in the results. Defaults to false.
        // @returns {Promise<Array>} - An array of objects that match the criteria
        getChildrenObjects: async (object: ObjectTypes, parent: string|null, includeContent: boolean = false): Promise<object[]> => {
            return db.all(
                `SELECT ${getFields(includeContent)} FROM ${DOCUMENTS_TABLE_NAME} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
                [object, parent],
            );
        },

        // @description get all tokens
        // @returns {Promise<Array<Token>>} - An array of all tokens in the database
        getAllTokens: async (): Promise<Token[]> => {
            return db.all(`SELECT * FROM ${TOKENS_TABLE_NAME}`);
        },

        // @description get a token by user or token string
        // @param {string} user - The user ID to search for
        // @param {string} token - The token string to search for
        // @returns {Promise<Token|null>} - The token object if found, or null if not found
        getToken: async (user: string, token: string): Promise<Token|null> => {
            return db.get(
                `SELECT * FROM ${TOKENS_TABLE_NAME} WHERE user = ? OR token = ?`,
                [user, token],
            );
        },

        // @description insert a new token for a user
        // @param {string} user - The user ID for the token
        // @param {string} token - The token string to insert
        // @param {string} label - A label for the token
        // @returns {Promise<void>} - Resolves when the token is inserted
        insertToken: async (user: string, token: string, label: string): Promise<void> => {
            await db.run(
                `INSERT INTO ${TOKENS_TABLE_NAME} (user, token, label) VALUES (?, ?, ?)`,
                [user, token, label],
            );
        },

        // @description update an existing token for a user
        // @param {string} user - The user ID for the token
        // @param {string} token - The new token string to update
        // @returns {Promise<void>} - Resolves when the token is updated
        updateToken: async (user: string, token: string): Promise<void> => {
            await db.run(
                `UPDATE ${TOKENS_TABLE_NAME} SET token = ?, updated_at = CURRENT_TIMESTAMP WHERE user = ?`,
                [token, user],
            );
        },

        // @description delete a token for a user
        // @param {string} user - The user ID for the token to delete
        // @returns {Promise<void>} - Resolves when the token is deleted
        deleteToken: async (user: string): Promise<void> => {
            await db.run(
                `DELETE FROM ${TOKENS_TABLE_NAME} WHERE user = ?`,
                [user],
            );
        },
    };
};
