import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { uid } from "uid/secure";
import { DB_PATH, DB_TABLE, OBJECT_TYPES } from "./env";
import { DatabaseOptions, DatabaseManager } from "./types/database";

// get fields to query the database
const getFields = (includeContent: boolean = false): string => {
    const fields = [
        "id",
        "object",
        "parent",
        "created_at",
        "updated_at",
        "attributes"
    ];
    if (includeContent) {
        fields.push("content");
    }
    return fields.join(", ");
};

// create an instance of a database
export const createDatabase = async (options: DatabaseOptions = {}): Promise<DatabaseManager> => {
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
    // return api to access to the database
    return {
        // @description insert a new object into the database
        // @param {string} object - The type of object to insert
        // @param {string} parent - The parent ID of the object
        // @param {string} attributes - Additional attributes of the object
        // @param {string} content - The content of the object
        // @returns {Promise<string>} - The ID of the inserted object
        insertObject: async (object: string, parent: string, attributes: string, content: string): Promise<string> => {
            const id = uid(20); // generate a unique ID for the object
            await db.run(
                `INSERT INTO ${DB_TABLE} (id, object, parent, attributes, content) VALUES (?, ?, ?, ?, ?)`,
                [id, object, parent || null, attributes || "{}", content || ""],
            );
            return id; // return the ID of the inserted object
        },
        // @description get an object by its ID and type
        // @param {string} object - The type of object to retrieve
        // @param {string} id - The ID of the object to retrieve
        // @param {boolean} includeContent - Whether to include content in the result. Defaults to true.
        // @returns {Promise<Object>} - The object that matches the ID and type, or null if not found
        getObject: async (object: string, id?: string, includeContent?: boolean): Promise<object> => {
            return await db.get(
                `SELECT ${getFields(includeContent ?? true)} FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
                [id, object],
            );
        },
        // @description update an existing object in the database
        // @param {string} object - The type of object to update
        // @param {string} id - The ID of the object to update
        // @param {string} attributes - The new attributes for the object
        // @param {string} content - The new content for the object
        // @returns {Promise<void>} - Resolves when the update is complete
        updateObject: async (object: string, id: string, attributes: string = null, content: string = null): Promise<void> => {
            if (typeof attributes === "string") {
                await db.run(
                    `UPDATE ${DB_TABLE} SET attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
                    [attributes || "{}", id, object],
                );
            }
            if (typeof content === "string") {
                await db.run(
                    `UPDATE ${DB_TABLE} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
                    [content || "", id, object],
                );
            }
        },
        // @description delete an object from the database
        // @param {string} id - The ID of the object to delete
        // @param {string} object - The type of object to delete
        // @returns {Promise<void>} - Resolves when the deletion is complete
        deleteObject: async (object: string, id: string): Promise<void> => {
            // 1. delete the object itself
            await db.run(
                `DELETE FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
                [id, object],
            );
            // 2. remove all children of the object
            await db.run(`DELETE FROM ${DB_TABLE} WHERE parent = ?`, [id]);
        },
        // @description get children of a given parent object
        // @param {string} object - The type of object to search for
        // @param {string} parent - The parent ID to search for
        // @param {boolean} includeContent - Whether to include content in the results. Defaults to false.
        // @returns {Promise<Array>} - An array of objects that match the criteria
        getChildrenObjects: async (object: string, parent: string|null, includeContent: boolean = false): Promise<object[]> => {
            return db.all(
                `SELECT ${getFields(includeContent)} FROM ${DB_TABLE} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
                [object, parent],
            );
        },
    };
};
