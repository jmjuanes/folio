import Router from "@koa/router";
import { uid } from "uid/secure";
import { DB_TABLE, OBJECT_TYPES } from "../config.js";
import { database } from "../middlewares/database.js";
import { authentication } from "../middlewares/authentication.js";
import { formatResult } from "../utils/results.js";

export const boardRouter = new Router();

// apply middlewares to all routes
boardRouter.use(authentication);
boardRouter.use(database);

// GET - return nothing, this is just a placeholder
boardRouter.get("/", (ctx) => {
    return ctx.send(405, {
        message: "Method Not Allowed.",
    });
});

// GET - get the data of a single board
boardRouter.get("/:id", async (ctx) => {
    try {
        const result = await ctx.state.db.get(
            `SELECT id, object, parent, created_at, updated_at, content FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
            [ctx.params.id, OBJECT_TYPES.BOARD],
        );
        if (!result) {
            return ctx.send(404, {
                message: `Board '${ctx.params.id}' not found.`,
            });
        }
        // fetch properties of the board and merge them into the result
        const propertiesResults = await ctx.state.db.all(
            `SELECT id, object, parent, created_at, updated_at, content FROM ${DB_TABLE} WHERE object = ? AND parent = ?`,
            [OBJECT_TYPES.PROPERTY, ctx.params.id],
        );
        result.properties = propertiesResults.map(formatResult);
        return ctx.ok(formatResult(result));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// PATCH - update an existing board
boardRouter.patch("/:id", async (ctx) => {
    try {
        // update the board with the provided data
        await ctx.state.db.run(
            `UPDATE ${DB_TABLE} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
            [JSON.stringify(ctx.request.body || {}), ctx.params.id, OBJECT_TYPES.BOARD],
        );
        return ctx.ok({});
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update board.");
    }
});

// DELETE - delete a board
boardRouter.delete("/:id", async (ctx) => {
    try {
        await ctx.state.db.run(
            `DELETE FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
            [ctx.params.id, OBJECT_TYPES.BOARD],
        );
        return ctx.ok({});
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to delete board.");
    }
});

// GET - get the properties of a board
boardRouter.get("/:id/properties", async (ctx) => {
    try {
        const results = await ctx.state.db.all(
            `SELECT * FROM ${DB_TABLE} WHERE parent = ? AND object = ?`,
            [ctx.params.id, OBJECT_TYPES.PROPERTY],
        );
        // parse the JSON data
        return ctx.ok(results.map(formatResult));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve board properties.");
    }
});

// POST - add a new property to the board
boardRouter.post("/:id/properties", async ctx => {
    try {
        const id = uid(20);
        await ctx.state.db.run(
            `INSERT INTO ${DB_TABLE} (id, object, parent, content) VALUES (?, ?, ?, ?)`,
            [id, OBJECT_TYPES.PROPERTY, ctx.params.id, JSON.stringify(ctx.request.body || {})],
        );
        return ctx.ok({
            id: id,
        });
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed creating board property.");
    }
});
