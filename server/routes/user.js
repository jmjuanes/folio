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
        message: "ok",
    };
});

// GET - get user preferences
userRouter.get("/preferences", async (ctx) => {
    try {
        const item = await db.get("SELECT data FROM user_preferences WHERE user = ?", [ctx.state.user]);
        ctx.body = item?.data ? JSON.parse(item.data) : {};
    }
    catch (error) {
        ctx.throw(500, "Failed to retrieve user preferences.");
    }
});

// POST - update user preferences
userRouter.post("/preferences", async (ctx) => {
    try {
        const jsonString = JSON.stringify(ctx.request.body);
        await db.run(
            "INSERT INTO user_preferences (user, data) VALUES (?, ?) ON CONFLICT(user) DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP",
            [ctx.state.user, jsonString, jsonString],
        );
        ctx.body = {
            message: "ok",
        };
    }
    catch (error) {
        ctx.throw(500, "Failed to update user preferences.");
    }
});

// GET - get user libraries
userRouter.get("/libraries", async (ctx) => {
    try {
        const item = await db.get("SELECT version, items FROM libraries WHERE owner = ?", [ctx.state.user]);
        ctx.body = {
            version: item?.version || 1,
            items: item?.items ? JSON.parse(item.items) : [],
        };
    }
    catch (error) {
        ctx.throw(500, "Failed to retrieve user libraries.");
    }
});

// POST - update user libraries
userRouter.post("/libraries", async (ctx) => {
    const {version, items} = ctx.request.body;
    try {
        const jsonString = JSON.stringify(items || []);
        await db.run(
            "INSERT INTO libraries (owner, version, items) VALUES (?, ?, ?) ON CONFLICT(owner) DO UPDATE SET version = ?, items = ?, updated_at = CURRENT_TIMESTAMP",
            [ctx.state.user, version, jsonString, version, jsonString],
        );
        ctx.body = {
            message: "ok",
        };
    }
    catch (error) {
        ctx.throw(500, "Failed to update user libraries.");
    }
});
