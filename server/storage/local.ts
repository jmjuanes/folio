import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Collections } from "../types/storage.ts";
import { createLogger } from "../utils/logger.ts";
import type { Config } from "../config.ts";
import type { StoreContext, Document, DocumentData } from "../types/storage.ts";

const { debug } = createLogger("folio:storage:local");

const DB_PATH = "data/folio.db";
const TABLE = "documents";

// decode a document data to get attributes and content in the correct format
const parseDocument = (rawDocument: any): Document => {
    const { data, ...attributes } = rawDocument; // extract internal values and data from document
    return {
        ...JSON.parse(data || "{}"),
        _id: attributes.id,
        _created_at: attributes.created_at,
        _updated_at: attributes.updated_at,
    };
};

// create an instance of a store
export const createLocalStore = async (config: Config): Promise<StoreContext> => {
    const storePath = path.resolve(config.storage_file || DB_PATH);

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
        CREATE TABLE IF NOT EXISTS ${TABLE} (
            collection TEXT NOT NULL,
            id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data TEXT,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${TABLE}_id ON ${TABLE} (id);
        CREATE INDEX IF NOT EXISTS idx_${TABLE}_id_collection ON ${TABLE} (id, collection);
    `);

    // return api to access to the database
    return {
        all: async (collection: Collections): Promise<Document[]> => {
            const results = await db.all(`SELECT * FROM ${TABLE} WHERE collection = ?`, [ collection ]);
            return results.map((result: any): Document => {
                return parseDocument(result);
            });
        },

        get: async (collection: Collections, id: string): Promise<Document> => {
            const result = await db.get(
                `SELECT * FROM ${TABLE} WHERE id = ? AND collection = ?`,
                [ id, collection ],
            );
            return parseDocument(result);
        },

        add: async (collection: Collections, id: string, data: DocumentData = {}): Promise<void> => {
            await db.run(
                `INSERT INTO ${TABLE} (id, collection, data) VALUES (?, ?, ?)`,
                [ id, collection, JSON.stringify(data) ],
            );
        },

        set: async (collection: Collections, id: string, data: DocumentData = {}): Promise<void> => {
            await db.run(
                `UPDATE ${TABLE} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND collection = ?`,
                [ JSON.stringify(data), id, collection ],
            );
        },

        delete: async (collection: Collections, id: string): Promise<void> => {
            await db.run(`DELETE FROM ${TABLE} WHERE id = ? AND collection = ?`, [ id, collection ]);
        },
    };
};
