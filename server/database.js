import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "node:path";
import fs from "node:fs";
import environment from "./utils/environment.js";

// Ensure data directory exists
const DATA_DIR = environment.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true,
    });
}

export const DB_PATH = path.join(DATA_DIR, "folio.sqlite");

// Initialize database
const initDB = async () => {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
    // Create boards table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS boards (
            id TEXT NOT NULL PRIMARY KEY,
            name TEXT NOT NULL DEFAULT 'Untitled',
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    return db;
};

const db = await initDB();

export default db;
