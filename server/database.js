import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "node:path";
import fs from "node:fs";
import environment from "./utils/environment.js";

// get the path to the database
export const DB_PATH = environment.DB_PATH || path.join(process.cwd(), "data", "folio.sqlite");

// Initialize database
const initDB = async () => {
    // 1. ensure the data directory exists
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    // 2. open the SQLite database
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
    // 3. create boards table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS boards (
            id TEXT NOT NULL PRIMARY KEY,
            owner TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT 'Untitled',
            thumbnail TEXT,
            private BOOLEAN DEFAULT TRUE,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS libraries (
            owner TEXT NOT NULL PRIMARY KEY,
            version INTEGER NOT NULL DEFAULT 1,
            items TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_preferences (
            user TEXT NOT NULL PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    return db;
};

const db = await initDB();

export default db;
