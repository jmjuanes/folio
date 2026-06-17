import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { resolve, dirname } from "node:path";
import { createLogger } from "./logger.ts";
import type { KVAdaptor, KVAdaptorListOptions, KVAdaptorPutOptions } from "./types.ts";

export const createKV = async (path: string, namespace: string): Promise<KVAdaptor> => {
    const { debug } = createLogger(`folio:kv:${namespace}`);
    let databasePath = ""; // to save real path to database
    if (path.startsWith("local:")) {
        databasePath = resolve(process.cwd(), path.replace("local:", ""));
        // make sure that the parent directory exists
        if (!existsSync(dirname(databasePath))) {
            debug(`folder ${dirname(databasePath)} does not exist, trying to create it...`);
            await mkdir(dirname(databasePath), { recursive: true });
        }
        debug(`using database in '${databasePath}'`);
    }
    // 2. if other value is provided, use in-memory database mode
    else {
        debug("using in-memory database");
        debug("note that this method is not persistent and data saved will be deleted when the server is stopped");
        databasePath = ":memory:";
    }
    // 3. create and initialize the database
    const db = new DatabaseSync(databasePath);
    db.exec(`
        CREATE TABLE IF NOT EXISTS kv (
            key TEXT PRIMARY KEY,
            value TEXT,
            metadata TEXT
        ) STRICT;
    `);
    // 4. return adaptor
    return Promise.resolve({
        get: (key: string, type: string = "text"): Promise<any | null> => {
            return new Promise(resolve => {
                const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key);
                if (row) {
                    return resolve(type === "json" ? JSON.parse(row.value as string) : row.value as string);
                }
                return resolve(null);
            });
        },
        put: (key: string, value: any, options: KVAdaptorPutOptions = {}): Promise<void> => {
            return new Promise(resolve => {
                const valueToSave = typeof value === "object" ? JSON.stringify(value) : value;
                const metadata = JSON.stringify(options?.metadata || {});
                db.prepare(`
                    INSERT INTO kv (key, value, metadata) VALUES (?, ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, metadata = excluded.metadata
                `).run(key, valueToSave, metadata);
                resolve();
            });
        },
        delete: (key: string): Promise<void> => {
            return new Promise(resolve => {
                db.prepare("DELETE FROM kv WHERE key = ?").run(key);
                resolve();
            });
        },
        list: (options: KVAdaptorListOptions = {}) => {
            return new Promise(resolve => {
                const prefix = options.prefix || "";
                const rows = db.prepare("SELECT key, metadata FROM kv WHERE key LIKE ?").all(`${prefix}%`);
                return resolve({
                    keys: (rows || []).map(row => ({
                        name: row.key as string,
                        metadata: row.metadata ? JSON.parse(row.metadata as string) : {},
                    })),
                });
            });
        },
    });
};
