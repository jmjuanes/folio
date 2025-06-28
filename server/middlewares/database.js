import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { uid } from "uid/secure";
import { DB_PATH, DB_TABLE, OBJECT_TYPES } from "../config.js";

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
    // 3. create store table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${DB_TABLE} (
            id TEXT NOT NULL,
            object TEXT NOT NULL,
            parent TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            content TEXT NOT NULL,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_id ON ${DB_TABLE} (id);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_id_object ON ${DB_TABLE} (id, object);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_parent ON ${DB_TABLE} (parent);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_parent_object ON ${DB_TABLE} (parent, object);
    `);
    // verify that the table has a record for the user object
    const userExists = await db.get(`SELECT COUNT(*) as count FROM ${DB_TABLE} WHERE object = ?`, [OBJECT_TYPES.USER]);
    // if the user object does not exist, create it
    if (userExists.count === 0) {
        await db.run(
            `INSERT INTO ${DB_TABLE} (id, object, content) VALUES (?, ?, ?)`,
            [uid(20), OBJECT_TYPES.USER, JSON.stringify({})],
        );
    }
    return db;
};

// get the database instance
export const db = await initDB();

// export the database middleware
export const database = async (ctx, next) => {
    ctx.state.db = db; // attach the database instance to the context
    await next(); // call the next middleware or route handler
};
