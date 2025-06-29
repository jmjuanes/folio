import Router from "@koa/router";
import { OBJECT_TYPES } from "../config.js";
import { authentication } from "../middlewares/authentication.js";
import { getObject, updateObject, deleteObject } from "../service.js";
import { formatResult } from "../utils/results.js";

export const propertiesRouter = new Router();

// apply middlewares to all routes
propertiesRouter.use(authentication);

// GET - retrieve a single property by ID
propertiesRouter.get("/:id", async ctx => {
    try {
        const result = await getObject(ctx.params.id, OBJECT_TYPES.PROPERTY);
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
        await updateObject(ctx.params.id, OBJECT_TYPES.PROPERTY, ctx.request.body || {});
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
        await deleteObject(ctx.params.id, OBJECT_TYPES.PROPERTY);
        return ctx.ok({});
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to delete property.");
    }
});
