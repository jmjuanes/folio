import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "node:fs";
import path from "node:path";
import {DB_PATH, DB_TABLES} from "../config.js";

// initialize database
const initDB = async () => {
    // 1. ensure the database directory exists
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
        CREATE TABLE IF NOT EXISTS ${DB_TABLES.BOARDS} (
            id TEXT NOT NULL PRIMARY KEY,
            owner TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT 'Untitled',
            preview TEXT,
            icon TEXT,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS ${DB_TABLES.PREFERENCES} (
            user TEXT NOT NULL PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    return db;
};

// get the database instance
export const db = await initDB();

// export the database middleware
export const database = async (ctx, next) => {
    ctx.state.db = db; // attach the database instance to the context
    await next(); // call the next middleware or route handler
};
