import Router from "@koa/router";
import { uid } from "uid/secure";
import { DB_TABLE, OBJECT_TYPES } from "../config.js";
import { database } from "../middlewares/database.js";
import { authentication } from "../middlewares/authentication.js";
import { formatResult } from "../utils/results.js";

export const userRouter = new Router();

// apply middlewares to all routes
userRouter.use(authentication);
userRouter.use(database);

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
        const results = await ctx.state.db.all(
            `SELECT id, object, parent, created_at, updated_at, content FROM ${DB_TABLE} WHERE object = ? AND parent = ? ORDER BY updated_at DESC`,
            [OBJECT_TYPES.BOARD, ctx.state.user_id],
        );
        // note: we have to fetch also properties of the boards
        if (results.length > 0) {
            const ids = results.map(result => result.id);
            const propertiesResults = await ctx.state.db.all(
                `SELECT id, object, parent, created_at, updated_at, content FROM ${DB_TABLE} WHERE object = ? AND parent IN (${ids.map(() => "?").join(", ")})`,
                [OBJECT_TYPES.PROPERTY, ...ids],
            );
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
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// POST - create a new board for the authenticated user
userRouter.post("/boards", async ctx => {
    try {
        const id = uid(20); // generate a unique ID for the board
        await ctx.state.db.run(
            `INSERT INTO ${DB_TABLE} (id, object, parent, content) VALUES (?, ?, ?, ?)`,
            [id, OBJECT_TYPES.BOARD, ctx.state.user_id, JSON.stringify(ctx.request.body || {})],
        );
        // return the ID of the created board
        return ctx.ok({
            id: id,
        });
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to create board.");
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
