import Router from "koa-router";
import {uid} from "uid/secure";
import db from "../database.js";
import {authenticateToken} from "../middleware/authentication.js";

export const boardRouter = new Router();

// Apply authentication middleware to all routes
boardRouter.use(authenticateToken);

// GET - list all available boards
boardRouter.get("/", async (ctx) => {
    try {
        const items = await db.all("SELECT id, name, created_at, updated_at FROM boards ORDER BY updated_at DESC");
        ctx.body = items;
    } catch (error) {
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// POST - create a new board
boardRouter.post("/", async (ctx) => {
    const {name} = ctx.request.body;
    try {
        const id = uid(16); // Generate a unique ID for the board
        await db.run("INSERT INTO boards (id, name, data) VALUES (?, ?, ?)", [id, name || "Untitled", JSON.stringify({})]);
        ctx.body = {
            id: id,
        };
    }
    catch (error) {
        ctx.throw(500, "Failed to create board.");
    }
});

// GET - get a specific board by ID
boardRouter.get("/:id", async (ctx) => {
    try {
        const item = await db.get("SELECT id, name, json_extract(data, '$') as data, created_at, updated_at FROM boards WHERE id = ?", [ctx.params.id]);
        // no board returned after query
        if (!item) {
            return ctx.sendError(ctx, 404, `Board '${ctx.params.id}' not found.`);
        }
        // parse the JSON data
        item.data = JSON.parse(item.data);
        ctx.body = item;
    } catch (error) {
        ctx.throw(500, "Failed to retrieve board.");
    }
});

// POST - update an existing board
boardRouter.post("/:id", async (ctx) => {
    const {data} = ctx.request.body;
    try {
        // Validate that data is valid JSON
        const jsonData = typeof data === "string" ? JSON.parse(data) : data;
        // Stringify the data to store in SQLite
        const jsonString = JSON.stringify();
        await db.run("UPDATE boards SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [jsonString, ctx.params.id]);
        ctx.body = {
            message: "ok",
        };
    } catch (error) {
        ctx.throw(500, "Failed to save board data.");
    }
});

// DELETE - delete a board
boardRouter.delete("/:id", async (ctx) => {
    try {
        await db.run("DELETE FROM boards WHERE id = ?", [ctx.params.id]);
        ctx.body = {
            message: "ok",
        };
    } catch (error) {
        ctx.throw(500, "Failed to delete board.");
    }
});
