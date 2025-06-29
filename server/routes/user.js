import Router from "@koa/router";
import { OBJECT_TYPES } from "../config.js";
import { authentication } from "../middlewares/authentication.js";
import { insertObject, updateObject, getChildrenObjects } from "../service.js";
import { formatResult } from "../utils/results.js";

export const userRouter = new Router();

// apply middlewares to all routes
userRouter.use(authentication);

// GET - get information of the authenticated user
userRouter.get("/", async ctx => {
    // Note: currently we do not support user management, so this endpoint is only used to 
    // verify that the user is authenticated and to return a success message.
    return ctx.ok({
        id: ctx.state.user_id,
    });
});

// GET - get boards of the authenticated user
userRouter.get("/boards", async ctx => {
    try {
        const results = await getChildrenObjects(OBJECT_TYPES.BOARD, ctx.state.user_id);
        // note: we have to fetch also properties of the boards
        if (results.length > 0) {
            const ids = results.map(result => result.id);
            const propertiesResults = await getChildrenObjects(OBJECT_TYPES.PROPERTY, ids);
            // merge properties with boards results
            results.forEach(result => {
                result.properties = propertiesResults
                    .filter(prop => prop.parent === result.id)
                    .map(formatResult);
            });
        }
        return ctx.ok(results.map(formatResult));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards.");
    }
});

// POST - create a new board for the authenticated user
userRouter.post("/boards", async ctx => {
    try {
        const id = await insertObject(OBJECT_TYPES.BOARD, ctx.state.user_id, ctx.request.body);
        return ctx.ok({
            id: id,
        });
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to create board.");
    }
});

// GET - get the library of the authenticated user
userRouter.get("/library", async ctx => {
    try {
        // note: currently this endpoint only suppoorts a single library per user
        const results = await getChildrenObjects(OBJECT_TYPES.LIBRARY, ctx.state.user_id);
        if (results.length === 0) {
            await insertObject(OBJECT_TYPES.LIBRARY, ctx.state.user_id, {});
            return ctx.ok({});
        }
        return ctx.ok(formatResult(results[0]));
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve library.");
    }
});

// PATCH - update the library of the authenticated user
userRouter.patch("/library", async ctx => {
    try {
        // note: currently this endpoint only supports a single library per user
        // so we will either insert a new library or update the existing one
        // first, check if the library already exists
        const results = await getChildrenObjects(OBJECT_TYPES.LIBRARY, ctx.state.user_id);
        // if it does not exist, create a new one
        if (results.length === 0) {
            await insertObject(OBJECT_TYPES.LIBRARY, ctx.state.user_id, ctx.request.body || {});
        }
        // if it exists, update the existing one
        else if (results.length === 1) {
            const id = results[0].id;
            await updateObject(id, OBJECT_TYPES.LIBRARY, ctx.request.body || {});
        }
        // what??
        else {
            ctx.throw(500, "Multiple libraries found for the user, which is not supported.");
        }
        return ctx.ok({
            message: "Library updated.",
        });
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update library.");
    }
});

// // GET - get user preferences
// userRouter.get(API_USER_ENDPOINTS.PREFERENCES, async (ctx) => {
//     try {
//         const item = await ctx.state.db.get(
//             `SELECT data FROM ${DB_TABLES.PREFERENCES} WHERE user = ?`,
//             [ctx.state.user],
//         );
//         ctx.body = item?.data ? JSON.parse(item.data) : {};
//     }
//     catch (error) {
//         console.error(error);
//         ctx.throw(500, "Failed to retrieve user preferences.");
//     }
// });
// 
// // PATCH - update user preferences
// userRouter.patch(API_USER_ENDPOINTS.PREFERENCES, async (ctx) => {
//     try {
//         const jsonString = JSON.stringify(ctx.request.body);
//         await ctx.state.db.run(
//             `INSERT INTO ${DB_TABLES.PREFERENCES} (user, data) VALUES (?, ?) ON CONFLICT(user) DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP`,
//             [ctx.state.user, jsonString, jsonString],
//         );
//         ctx.body = {
//             message: "ok",
//         };
//     }
//     catch (error) {
//         console.error(error);
//         ctx.throw(500, "Failed to update user preferences.");
//     }
// });
