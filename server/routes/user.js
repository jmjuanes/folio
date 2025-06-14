import Router from "koa-router";
import db from "../database.js";
import {authenticateToken} from "../middleware/authentication.js";

export const userRouter = new Router();

// apply authentication middleware to all routes
userRouter.use(authenticateToken);

// GET - get information of the authenticated user
userRouter.get("/", async (ctx) => {
    // Note: currently we do not support user management, so this endpoint is only used to 
    // verify that the user is authenticated and to return a success message.
    ctx.body = {
        // url: ctx.getUrl("api/users/" + ctx.state.user),
        preferences_url: ctx.getUrl("api/user/preferences"),
        boards_url: ctx.getUrl("api/user/boards"),
        id: ctx.state.user,
        email: null,
    };
});

// GET - get user preferences
userRouter.get("/preferences", async (ctx) => {
    try {
        const item = await db.get("SELECT data FROM preferences WHERE user = ?", [ctx.state.user]);
        ctx.body = item?.data ? JSON.parse(item.data) : {};
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve user preferences.");
    }
});

// PATCH - update user preferences
userRouter.patch("/preferences", async (ctx) => {
    try {
        const jsonString = JSON.stringify(ctx.request.body);
        await db.run(
            "INSERT INTO preferences (user, data) VALUES (?, ?) ON CONFLICT(user) DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP",
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
userRouter.get("/boards", async (ctx) => {
    try {
        const items = await db.all(
            "SELECT id, owner, name, thumbnail, created_at, updated_at FROM boards WHERE owner = ? ORDER BY updated_at DESC",
            [ctx.state.user],
        );
        ctx.body = items;
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});
