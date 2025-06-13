import Router from "koa-router";
import {uid} from "uid/secure";
import db from "../database.js";
import {authenticateToken} from "../middleware/authentication.js";

export const boardRouter = new Router();

// Apply authentication middleware to all routes
boardRouter.use(authenticateToken);

// GET - list all boards
boardRouter.get("/", async (ctx) => {
    try {
        const items = await db.all("SELECT id, owner, name, thumbnail, created_at, updated_at FROM boards ORDER BY updated_at DESC");
        ctx.body = items;
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// POST - create a new board
boardRouter.post("/", async (ctx) => {
    const {name} = ctx.request.body;
    try {
        const id = uid(16); // Generate a unique ID for the board
        await db.run(
            "INSERT INTO boards (id, owner, name, data) VALUES (?, ?, ?, ?)",
            [id, ctx.state.user, name || "Untitled", "{}"],
        );
        ctx.body = {
            message: "ok",
            id: id,
        };
    }
    catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to create board.");
    }
});

// GET - get a specific board by ID
boardRouter.get("/:id", async (ctx) => {
    try {
        const item = await db.get(
            "SELECT id, owner, name, thumbnail, created_at, updated_at FROM boards WHERE id = ? AND owner = ?",
            [ctx.params.id, ctx.state.user],
        );
        // no board returned after query
        if (!item) {
            return ctx.sendError(ctx, 404, `Board '${ctx.params.id}' not found.`);
        }
        // parse the JSON data
        item.data = JSON.parse(item.data);
        ctx.body = item;
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve board.");
    }
});

// PATCH - update an existing board
boardRouter.patch("/:id", async (ctx) => {
    const {name, thumbnail} = ctx.request.body;
    try {
        // Update the board with the provided data
        await db.run(
            "UPDATE boards SET name = ?, thumbnail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner = ?",
            [name, thumbnail, ctx.params.id, ctx.state.user],
        );
        ctx.body = {
            message: "ok",
            id: ctx.params.id,
        };
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to update board.");
    }
});

// DELETE - delete a board
boardRouter.delete("/:id", async (ctx) => {
    try {
        await db.run(
            "DELETE FROM boards WHERE id = ? AND owner = ?",
            [ctx.params.id, ctx.state.user],
        );
        ctx.body = {
            message: "ok",
            id: ctx.params.id,
        };
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to delete board.");
    }
});

// GET - get the data of a specific board by ID
boardRouter.get("/:id/data", async (ctx) => {
    try {
        const item = await db.get(
            "SELECT data FROM boards WHERE id = ? AND owner = ?",
            [ctx.params.id, ctx.state.user],
        );
        if (!item) {
            return ctx.sendError(ctx, 404, `Board '${ctx.params.id}' not found.`);
        }
        // parse the JSON data
        ctx.body = JSON.parse(item.data);
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve board data.");
    }
});

// PATCH - update an existing board data
boardRouter.patch("/:id/data", async (ctx) => {
    try {
        await db.run(
            "UPDATE boards SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner = ?",
            [JSON.stringify(ctx.request.body), ctx.params.id, ctx.state.user],
        );
        ctx.body = {
            message: "ok",
            id: ctx.params.id,
        };
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to save board data.");
    }
});
