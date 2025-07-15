import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { uid } from "uid/secure";
import { DB_PATH, DB_TABLE, OBJECT_TYPES } from "./env";

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
            attributes TEXT,
            content TEXT,
            PRIMARY KEY (id)
        );
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_id ON ${DB_TABLE} (id);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_id_object ON ${DB_TABLE} (id, object);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_parent ON ${DB_TABLE} (parent);
        CREATE INDEX IF NOT EXISTS idx_${DB_TABLE}_parent_object ON ${DB_TABLE} (parent, object);
    `);
    // verify that the table has a record for the user object
    // if the root user object does not exist, create it
    const userExists = await db.get(`SELECT COUNT(*) as count FROM ${DB_TABLE} WHERE object = ?`, [OBJECT_TYPES.USER]);
    if (userExists.count === 0) {
        await db.run(
            `INSERT INTO ${DB_TABLE} (id, object, attributes, content) VALUES (?, ?, ?, ?)`,
            [uid(20), OBJECT_TYPES.USER, "{}", "{}"],
        );
    }
    return db;
};

// get the database instance
export const db = await initDB();

// @description insert a new object into the database
// @param {string} object - The type of object to insert
// @param {string} parent - The parent ID of the object
// @param {string} attributes - Additional attributes of the object
// @param {string} content - The content of the object
// @returns {Promise<string>} - The ID of the inserted object
export const insertObject = async (object: string, parent: string, attributes: string, content: string): Promise<string> => {
    const id = uid(20); // generate a unique ID for the object
    await db.run(
        `INSERT INTO ${DB_TABLE} (id, object, parent, attributes, content) VALUES (?, ?, ?, ?, ?)`,
        [id, object, parent || null, attributes || "{}", content || ""],
    );
    return id; // return the ID of the inserted object
};

// @description get an object by its ID and type
// @param {string} object - The type of object to retrieve
// @param {string} id - The ID of the object to retrieve
// @returns {Promise<Object>} - The object that matches the ID and type, or null if not found
export const getObject = async (object: string, id: string): Promise<any> => {
    return await db.get(
        `SELECT id, object, parent, attributes, created_at, updated_at FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
        [id, object],
    );
};

// @description update an existing object in the database
// @param {string} object - The type of object to update
// @param {string} id - The ID of the object to update
// @param {string} attributes - The new attributes for the object
// @returns {Promise<void>} - Resolves when the update is complete
export const updateObject = async (object: string, id: string, attributes: string): Promise<void> => {
    await db.run(
        `UPDATE ${DB_TABLE} SET attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
        [attributes || "{}", id, object],
    );
};

// @description get the content of an object by its ID and type
// @param {string} object - The type of object to retrieve
// @param {string} id - The ID of the object to retrieve
// @returns {Promise<Object>} - The content of the object that matches the ID and type
export const getObjectContent = async (object: string, id: string): Promise<any> => {
    return db.get(
        `SELECT content FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
        [id, object],
    );
};

// @description update the content of an object in the database
// @param {string} object - The type of object to update
// @param {string} id - The ID of the object to update
// @param {string} content - The new content for the object
// @returns {Promise<void>} - Resolves when the update is complete
export const updateObjectContent = async (object: string, id: string, content: string): Promise<void> => {
    await db.run(
        `UPDATE ${DB_TABLE} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
        [content || "", id, object],
    );
};

// @description delete an object from the database
// @param {string} id - The ID of the object to delete
// @param {string} object - The type of object to delete
// @returns {Promise<void>} - Resolves when the deletion is complete
export const deleteObject = async (object: string, id: string): Promise<void> => {
    // 1. delete the object itself
    await db.run(
        `DELETE FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
        [id, object],
    );
    // 2. remove all children of the object
    await db.run(`DELETE FROM ${DB_TABLE} WHERE parent = ?`, [id]);
};

// @description get children of a given parent object
// @param {string} object - The type of object to search for
// @param {string} parent - The parent ID to search for
// @returns {Promise<Array>} - An array of objects that match the criteria
export const getChildrenObjects = async (object: string, parent: string): Promise<any[]> => {
    return db.all(
        `SELECT id, object, parent, attributes, created_at, updated_at FROM ${DB_TABLE} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
        [object, parent],
    );
};
