import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Collections } from "../types/storage.ts";
import { createLogger } from "../utils/logger.ts";
import type { LocalStorageConfig} from "../config.ts";
import type { StoreContext} from "../types/storage.ts";

const { debug } = createLogger("folio:storage");

const DB_PATH = "data/folio.db";
const TABLE_NAME = "collections";

// create an instance of a store
export const createLocalStore = async (storeConfig: LocalStorageConfig): Promise<StoreContext> => {
    const storePath = path.resolve(storeConfig?.file || DB_PATH);

    // 1. ensure the database directory exists
    if (!fs.existsSync(path.dirname(storePath))) {
        debug(`folder ${storePath} does not exist, trying to create it...`);
        fs.mkdirSync(path.dirname(storePath), { recursive: true });
    }

    // 2. open the SQLite database
    debug(`using local database in ${storePath}`);
    const db = await open({
        filename: storePath,
        driver: sqlite3.Database
    });

    // 3. create store table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id TEXT NOT NULL,
            parent TEXT,
            collection TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            attributes TEXT,
            content TEXT,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id ON ${TABLE_NAME} (id);
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id_collection ON ${TABLE_NAME} (id, collection);
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id_parent ON ${TABLE_NAME} (id, parent);
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id_parent_collection ON ${TABLE_NAME} (id, parent, collection);
    `);

    // verify that the table has a record for the user object
    // if the root user object does not exist, create it
    // const userExists = await db.get(`SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE object = ?`, [Collections.USER]);
    // if (userExists.count === 0) {
    //     await db.run(
    //         `INSERT INTO ${TABLE_NAME} (id, object, attributes, content) VALUES (?, ?, ?, ?)`,
    //         [uid(20), Collections.USER, "{}", "{}"],
    //     );
    // }

    // return api to access to the database
    return {
        get: async (collection: Collections, id: string): Promise<any> => {
            const result = await db.get(
                `SELECT * FROM ${TABLE_NAME} WHERE id = ? AND collection = ?`,
                [id, collection],
            );
            // force to convert attributes field into object
            result.attributes = JSON.parse(result.attributes || "{}");
            delete result.collection; // remove collection from returned fields
            return result;
        },

        cursor: async (collection: Collections, callback: (row: object) => void): Promise<void> => {
            await db.each(`SELECT * FROM ${TABLE_NAME} WHERE collection = ?`, [collection], (error: any, result: any) => {
                if (!error && result) {
                    result.attributes = JSON.parse(result.attributes || "{}");
                    delete result.collection; // remove collection from returned fields
                    callback(result);
                }
            });
        },

        add: async (collection: Collections, id: string, parent: string = "", attributes: any = {}, content: string = ""): Promise<void> => {
            await db.run(
                `INSERT INTO ${TABLE_NAME} (id, collection, parent, attributes, content) VALUES (?, ?, ?, ?, ?)`,
                [id, collection, parent || "", JSON.stringify(attributes || {}), content],
            );
        },

        set: async (collection: Collections, id: string, parent: string, attributes: any, content: string): Promise<void> => {
            if (typeof attributes === "object" && !!attributes) {
                await db.run(
                    `UPDATE ${TABLE_NAME} SET attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND collection = ? AND parent = ?`,
                    [JSON.stringify(attributes || {}), id, collection, parent],
                );
            }
            if (typeof content === "string") {
                await db.run(
                    `UPDATE ${TABLE_NAME} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND collection = ? AND parent = ?`,
                    [content || "", id, collection, parent],
                );
            }
        },

        delete: async (collection: Collections, id: string, parent: string): Promise<void> => {
            await db.run(
                `DELETE FROM ${TABLE_NAME} WHERE id = ? AND collection = ? AND parent = ?`,
                [id, collection, parent],
            );
        },
    };
};
