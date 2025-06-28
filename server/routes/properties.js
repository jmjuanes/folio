import Router from "@koa/router";
import { DB_TABLE, OBJECT_TYPES } from "../config.js";
import { database } from "../middlewares/database.js";
import { authentication } from "../middlewares/authentication.js";
import { formatResult } from "../utils/results.js";

export const propertiesRouter = new Router();

// apply middlewares to all routes
propertiesRouter.use(authentication);
propertiesRouter.use(database);

// GET - retrieve a single property by ID
propertiesRouter.get("/:id", async ctx => {
    try {
        const result = await ctx.state.db.get(
            `SELECT id, object, parent, created_at, updated_at, content FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
            [ctx.params.id, OBJECT_TYPES.PROPERTY],
        );
        if (!result) {
            return ctx.send(404, {
                message: `Property '${ctx.params.id}' not found.`,
            });
        }
        return ctx.ok(formatResult(result));
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve property from database.");
    }
});

// PATCH - update an existing property
propertiesRouter.patch("/:id", async ctx => {
    try {
        await ctx.state.db.run(
            `UPDATE ${DB_TABLE} SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND object = ?`,
            [JSON.stringify(ctx.request.body || {}), ctx.params.id, OBJECT_TYPES.PROPERTY],
        );
        return ctx.ok({});
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update property.");
    }
});

// DELETE - delete a property
propertiesRouter.delete("/:id", async ctx => {
    try {
        await ctx.state.db.run(
            `DELETE FROM ${DB_TABLE} WHERE id = ? AND object = ?`,
            [ctx.params.id, OBJECT_TYPES.PROPERTY],
        );
        return ctx.ok({});
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to delete property.");
    }
});
