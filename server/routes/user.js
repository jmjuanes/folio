import Router from "koa-router";
import {API_USER_ENDPOINTS, DB_TABLES} from "../config.js";
import {database} from "../middleware/database.js";
import {authentication} from "../middleware/authentication.js";

export const userRouter = new Router();

// apply middlewares to all routes
userRouter.use(authentication);
userRouter.use(database);

// GET - get information of the authenticated user
userRouter.get(API_USER_ENDPOINTS.USER, async (ctx) => {
    // Note: currently we do not support user management, so this endpoint is only used to 
    // verify that the user is authenticated and to return a success message.
    ctx.body = {
        id: ctx.state.user,
        email: null,
    };
});

// GET - get user preferences
userRouter.get(API_USER_ENDPOINTS.PREFERENCES, async (ctx) => {
    try {
        const item = await ctx.state.db.get(
            `SELECT data FROM ${DB_TABLES.PREFERENCES} WHERE user = ?`,
            [ctx.state.user],
        );
        ctx.body = item?.data ? JSON.parse(item.data) : {};
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve user preferences.");
    }
});

// PATCH - update user preferences
userRouter.patch(API_USER_ENDPOINTS.PREFERENCES, async (ctx) => {
    try {
        const jsonString = JSON.stringify(ctx.request.body);
        await ctx.state.db.run(
            `INSERT INTO ${DB_TABLES.PREFERENCES} (user, data) VALUES (?, ?) ON CONFLICT(user) DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP`,
            [ctx.state.user, jsonString, jsonString],
        );
        ctx.body = {
            message: "ok",
        };
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update user preferences.");
    }
});

// GET - list all boards of the authenticated user
userRouter.get(API_USER_ENDPOINTS.BOARDS, async (ctx) => {
    try {
        const items = await ctx.state.db.all(
            `SELECT id, owner, name, thumbnail, created_at, updated_at FROM ${DB_TABLES.BOARDS} WHERE owner = ? ORDER BY updated_at DESC`,
            [ctx.state.user],
        );
        ctx.body = items;
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});
