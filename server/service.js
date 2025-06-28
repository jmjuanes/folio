import { uid } from "uid";
import { db } from "./middlewares/database.js";
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

// @description get children of a given parent object
// @param {string} object - The type of object to search for
// @param {string | Array} parents - The parent ID to search for, or an array of parent IDs
// @returns {Promise<Array>} - An array of objects that match the criteria
export const getChildren = async (object, parents = []) => {
    if (!Array.isArray(parents)) {
        return db.all(
            `SELECT * FROM ${DB_TABLE} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
            [object, parents],
        );
    }
    return await ctx.state.db.all(
        `SELECT * FROM ${DB_TABLE} WHERE object = ? AND parent IN (${parents.map(() => "?").join(", ")})`,
        [OBJECT_TYPES.PROPERTY, ...parents],
    );
};
