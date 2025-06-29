import { uid } from "uid";
import { db } from "./database.js";
import { DB_TABLE } from "./config.js";

// @description insert a new object into the database
// @param {string} object - The type of object to insert
// @param {string} parent - The parent ID of the object
// @param {Object} content - The content of the object
// @returns {Promise<string>} - The ID of the inserted object
export const insertObject = async (object, parent = null, content = {}) => {
    const id = uid(20); // generate a unique ID for the object
    await db.run(
        `INSERT INTO ${DB_TABLE} (id, object, parent, content) VALUES (?, ?, ?, ?)`,
        [id, object, parent, JSON.stringify(content)],
    );
    return id; // return the ID of the inserted object
};

// @description get an object by its ID and type
// @param {string} id - The ID of the object to retrieve
// @param {string} object - The type of object to retrieve
// @returns {Promise<Object>} - The object that matches the ID and type, or null if not found
export const getObject = async (id, object) => {
    return await db.get(
        `SELECT * FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
        [id, object],
    );
};

// @description update an existing object in the database
// @param {string} id - The ID of the object to update
// @param {string} object - The type of object to update
// @param {Object} content - The new content for the object
// @returns {Promise<void>} - Resolves when the update is complete
export const updateObject = async (id, object, content = {}) => {
    await db.run(
        `UPDATE ${DB_TABLE} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
        [JSON.stringify(content), id, object],
    );
};

// @description delete an object from the database
// @param {string} id - The ID of the object to delete
// @param {string} object - The type of object to delete
// @returns {Promise<void>} - Resolves when the deletion is complete
export const deleteObject = async (id, object) => {
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
// @param {string | Array} parents - The parent ID to search for, or an array of parent IDs
// @returns {Promise<Array>} - An array of objects that match the criteria
export const getChildrenObjects = async (object, parents = []) => {
    if (!Array.isArray(parents)) {
        return db.all(
            `SELECT * FROM ${DB_TABLE} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
            [object, parents],
        );
    }
    return await db.all(
        `SELECT * FROM ${DB_TABLE} WHERE object = ? AND parent IN (${parents.map(() => "?").join(", ")})`,
        [object, ...parents],
    );
};
