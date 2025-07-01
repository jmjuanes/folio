import Router from "@koa/router";
import { OBJECT_TYPES } from "../config.js";
import { authentication } from "../middlewares/authentication.js";
import { getChildrenObjects, getObject, updateObject, insertObject, deleteObject } from "../service.js";
import { formatResult } from "../utils/results.js";

export const boardsRouter = new Router();

// apply middlewares to all routes
boardsRouter.use(authentication);

// GET - return nothing, this is just a placeholder
boardsRouter.get("/", (ctx) => {
    return ctx.send(405, {
        message: "Method Not Allowed.",
    });
});

// GET - get the data of a single board
boardsRouter.get("/:id", async (ctx) => {
    try {
        const result = await getObject(ctx.params.id, OBJECT_TYPES.BOARD);
        if (!result) {
            return ctx.send(404, {
                message: `Board '${ctx.params.id}' not found.`,
            });
        }
        // fetch properties of the board and merge them into the result
        const propertiesResults = await getChildrenObjects(OBJECT_TYPES.PROPERTY, ctx.params.id);
        result.properties = propertiesResults.map(formatResult);
        return ctx.ok(formatResult(result));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// PATCH - update an existing board
boardsRouter.patch("/:id", async (ctx) => {
    try {
        await updateObject(ctx.params.id, OBJECT_TYPES.BOARD, ctx.request.body || {});
        return ctx.ok({});
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update board.");
    }
});

// DELETE - delete a board
boardsRouter.delete("/:id", async (ctx) => {
    try {
        await deleteObject(ctx.params.id, OBJECT_TYPES.BOARD);
        return ctx.ok({});
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to delete board.");
    }
});

// GET - get the properties of a board
boardsRouter.get("/:id/properties", async (ctx) => {
    try {
        const results = await getChildrenObjects(OBJECT_TYPES.PROPERTY, ctx.params.id);
        return ctx.ok(results.map(formatResult));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve board properties.");
    }
});

// POST - add a new property to the board
boardsRouter.post("/:id/properties", async ctx => {
    try {
        const id = await insertObject(OBJECT_TYPES.PROPERTY, ctx.params.id, ctx.request.body || {});
        return ctx.ok({
            id: id,
        });
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed creating board property.");
    }
});
