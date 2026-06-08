import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { v4 as uuid } from "uuid";
import { createLogger } from "./utils/logger.ts";
import { runMigrations } from "./migrations.ts";
import { NotFoundError } from "./errors.ts";

import type { Document, DocumentWithAttributes, DocumentWithData } from "./types/document.ts";
import type { Config } from "./config.ts";

// objects store context
export type Storage = {
    getDocuments: () => Promise<Partial<DocumentWithAttributes>[]>;
    createDocument: (attributes: any, data: any) => Promise<Partial<Document>>;
    getDocument: (id: string) => Promise<Document>;
    deleteDocument: (id: string) => Promise<void>;
    getDocumentData: (id: string) => Promise<DocumentWithData>;
    updateDocumentData: (id: string, data: any) => Promise<void>;
    getDocumentAttributes: (id: string) => Promise<DocumentWithAttributes>;
    updateDocumentAttributes: (id: string, attributes: any) => Promise<void>;
};

const { debug } = createLogger("folio:storage");

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
            attributes TEXT,
            data TEXT,
            PRIMARY KEY (id)
        );
    `);

    // 4. run migrations
    await runMigrations(db, "storage");

    // return api to access to the database
    return {
        getDocuments: async (): Promise<DocumentWithAttributes[]> => {
            const results = await db.all(`SELECT id,created_at,updated_at,name,attributes FROM ${DOCUMENTS_TABLE} ORDER BY updated_at DESC`, []);
            return (results || []).map(result => {
                return Object.assign(result, {
                    attributes: JSON.parse(result.attributes || "{}"),
                }) as DocumentWithAttributes;
            });
        },
        createDocument: async (attributes: any, data: any): Promise<Partial<Document>> => {
            const id = uuid();
            await db.run(
                `INSERT INTO ${DOCUMENTS_TABLE} (id, attributes, data) VALUES (?, ?, ?)`,
                [id, JSON.stringify(attributes || "{}"), JSON.stringify(data || "{}")],
            );
            // return only the id of the generated document
            return { id };
        },
        getDocument: async (id: string): Promise<Document> => {
            const result = await db.get(`SELECT * FROM ${DOCUMENTS_TABLE} WHERE id = ?`, [id]);
            if (!result) {
                throw new NotFoundError(`Document with id '${id}' not found.`);
            }
            return Object.assign(result, {
                attributes: JSON.parse(result.attributes),
                data: JSON.parse(result.data),
            }) as Document;
        },
        deleteDocument: async (id: string): Promise<void> => {
            await db.run(`DELETE FROM ${DOCUMENTS_TABLE} WHERE id = ?`, [id]);
        },
        getDocumentData: async (id: string): Promise<DocumentWithData> => {
            const result = await db.get(`SELECT id,created_at,updated_at,data FROM ${DOCUMENTS_TABLE} WHERE id = ?`, [id]);
            if (!result) {
                throw new NotFoundError(`Document with id '${id}' not found.`);
            }
            return Object.assign(result, {
                data: JSON.parse(result.data || "{}"),
            });
        },
        updateDocumentData: async (id: string, data: any): Promise<void> => {
            // const document = await db.get(`SELECT id FROM ${DOCUMENTS_TABLE} WHERE id =`, [id]);
            // if (!document) {
            //     throw new NotFoundError(`Document with id '${id}' not found.`);
            // }
            // update the data field in the document
            await db.run(
                `UPDATE ${DOCUMENTS_TABLE} SET updated_at = CURRENT_TIMESTAMP, data = ? WHERE id = ?`,
                [JSON.stringify(data || "{}"), id],
            );
        },
        getDocumentAttributes: async (id: string): Promise<DocumentWithAttributes> => {
            const result = await db.get(`SELECT id,created_at,updated_at,attributes FROM ${DOCUMENTS_TABLE} WHERE id = ?`, [id]);
            if (!result) {
                throw new NotFoundError(`Document with id '${id}' not found.`);
            }
            return Object.assign(result, {
                attributes: JSON.parse(result.attributes || "{}"),
            });
        },
        updateDocumentAttributes: async (id: string, attributes: any): Promise<void> => {
            // const document = await db.get(`SELECT id FROM ${DOCUMENTS_TABLE} WHERE id =`, [id]);
            // if (!document) {
            //     throw new Error(`Document with id '${id}' not found.`);
            // }
            // update the attributes field in the document
            await db.run(
                `UPDATE ${DOCUMENTS_TABLE} SET updated_at = CURRENT_TIMESTAMP, attributes = ? WHERE id = ?`,
                [JSON.stringify(attributes || "{}"), id],
            );
        },
    } as Storage;
};

// main storage provider
export const createStore = async (config: Config): Promise<Storage> => {
    return createLocalStore(config);
};
