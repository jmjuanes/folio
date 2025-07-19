import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Collections } from "../types/storage.ts";
import type { LocalStorageConfig} from "../config.ts";
import type { StoreContext} from "../types/storage.ts";

const DB_PATH = "./data";
const DB_NAME = "folio.db";
const TABLE_NAME = "objects";

// create an instance of a store
export const createLocalStore = async (storeConfig: LocalStorageConfig): Promise<StoreContext> => {
    const storePath = path.resolve(storeConfig?.storePath || DB_PATH);

    // 1. ensure the database directory exists
    if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
    }

    // 2. open the SQLite database
    const db = await open({
        filename: path.join(storePath, storeConfig?.storeName || DB_NAME),
        driver: sqlite3.Database
    });

    // 3. create store table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id TEXT NOT NULL,
            collection TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            content TEXT,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id ON ${TABLE_NAME} (id);
        CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_id_collection ON ${TABLE_NAME} (id, collection);
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
        get: async (collection: Collections, id: string): Promise<object> => {
            return await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ? AND collection = ?`, [id, collection]);
        },

        cursor: async (collection: Collections, callback: (error: any, row: object) => void): Promise<void> => {
            await db.each(`SELECT * FROM ${TABLE_NAME} WHERE collection = ?`, [collection], callback);
        },

        insert: async (collection: Collections, id: string, content: string = ""): Promise<string> => {
            await db.run(`INSERT INTO ${TABLE_NAME} (id, collection, content) VALUES (?, ?, ?)`, [id, collection, content]);
            return id;
        },

        update: async (collection: Collections, id: string = null, content: string): Promise<void> => {
            await db.run(
                `UPDATE ${TABLE_NAME} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND collection = ?`,
                [content || "", id, collection],
            );
        },

        delete: async (collection: Collections, id: string): Promise<void> => {
            await db.run(`DELETE FROM ${TABLE_NAME} WHERE id = ? AND collection = ?`, [id, collection]);
        },
    };
};
