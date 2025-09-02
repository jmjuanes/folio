import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Collection } from "../types/document.ts";
import { createLogger } from "../utils/logger.ts";
import type { Config } from "../config.ts";
import type { Document, DocumentPayload, DocumentFilter } from "../types/document.ts";
import type { Storage } from "../types/storage.ts";

const { debug } = createLogger("folio:storage:local");

const DB_PATH = "data/documents.db";
const DOCUMENTS_TABLE = "documents";

// create an instance of a store
export const createLocalStore = async (config: Config): Promise<Storage> => {
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
        CREATE TABLE IF NOT EXISTS ${DOCUMENTS_TABLE} (
            collection TEXT NOT NULL,
            id TEXT NOT NULL,
            owner TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            name TEXT,
            thumbnail TEXT,
            data TEXT,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE}_owner ON ${DOCUMENTS_TABLE} (owner);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE}_owner_id ON ${DOCUMENTS_TABLE} (owner, id);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE}_owner_collection ON ${DOCUMENTS_TABLE} (owner, collection);
        CREATE INDEX IF NOT EXISTS idx_${DOCUMENTS_TABLE}_owner_id_collection ON ${DOCUMENTS_TABLE} (owner, id, collection);
    `);

    // return api to access to the database
    return {
        // get all documents for an owner
        queryDocuments: async (owner: string, filter?: DocumentFilter): Promise<Document[]> => {
            const whereClauses = [`owner = ?`]; // always filter by owner
            const params: (string)[] = [ owner ]; // parameters for the query

            // if a collection filter is provided, add it to the where clauses
            if (filter?.collection) {
                whereClauses.push(`collection = ?`);
                params.push(filter.collection);
            }

            // construct the final query
            const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
            const sql = `SELECT id,owner,collection,created_at,updated_at,name,thumbnail FROM ${DOCUMENTS_TABLE} ${whereSQL} ORDER BY updated_at DESC`;
            return await db.all(sql, params);
        },

        getDocument: async (owner: string, id: string): Promise<Document> => {
            return await db.get(`SELECT * FROM ${DOCUMENTS_TABLE} WHERE id = ? AND owner = ?`, [ id, owner ]);
        },

        addDocument: async (owner: string, id: string, payload: DocumentPayload): Promise<void> => {
            const collection = payload.collection as Collection;
            if (!collection) {
                throw new Error("collection is required when creating a new document");
            }
            if (!Object.values(Collection).includes(collection)) {
                throw new Error(`Invalid collection '${collection}', must be one of: ${Object.values(Collection).join(", ")}`);
            }
            await db.run(
                `INSERT INTO ${DOCUMENTS_TABLE} (owner, id, collection, name, thumbnail, data) VALUES (?, ?, ?, ?, ?, ?)`,
                [ owner, id, collection, payload.name || "Untitled", payload.thumbnail || "", payload.data || "" ],
            );
        },

        updateDocument: async (owner: string, id: string, payload: DocumentPayload): Promise<void> => {
            const document = await db.get(`SELECT id FROM ${DOCUMENTS_TABLE} WHERE id = ? AND owner = ?`, [ id, owner ]);
            if (!document) {
                throw new Error(`Document with id '${id}' not found for owner '${owner}'`);
            }

            // build the fields to update
            const setClauses = [ `updated_at = CURRENT_TIMESTAMP` ]; // always update the updated_at field
            const params: (string)[] = [];

            [ "name", "thumbnail", "data" ].forEach((field) => {
                if (typeof payload[field] === "string") {
                    setClauses.push(`${field} = ?`);
                    params.push(payload[field]);
                }
            });

            // construct the final query
            if (setClauses.length > 1) {
                const sql = `UPDATE ${DOCUMENTS_TABLE} SET ${setClauses.join(", ")} WHERE id = ? AND owner = ?`;
                await db.run(sql, [...params, id, owner]);
            }
        },

        deleteDocument: async (owner: string, id: string): Promise<void> => {
            await db.run(`DELETE FROM ${DOCUMENTS_TABLE} WHERE id = ? AND owner = ?`, [ id, owner ]);
        },
    };
};
