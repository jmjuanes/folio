import Router from "koa-router";
import {uid} from "uid/secure";
import {API_BOARDS_ENDPOINTS, DB_TABLES} from "../config.js";
import {database} from "../middleware/database.js";
import {authentication} from "../middleware/authentication.js";

export const boardRouter = new Router();

// apply middlewares to all routes
boardRouter.use(authentication);
boardRouter.use(database);

// GET - list all boards
boardRouter.get(API_BOARDS_ENDPOINTS.LIST_BOARDS, async (ctx) => {
    try {
        const items = await ctx.state.db.all(
            `SELECT id, owner, name, thumbnail, created_at, updated_at FROM ${DB_TABLES.BOARDS} ORDER BY updated_at DESC`,
        );
        ctx.body = items;
    } catch (error) {
        console.error(error);
        ctx.throw(500, "Failed to retrieve boards from database.");
    }
});

// POST - create a new board
boardRouter.post(API_BOARDS_ENDPOINTS.LIST_BOARDS, async (ctx) => {
    const {name} = ctx.request.body;
    try {
        const id = uid(16); // Generate a unique ID for the board
        await ctx.state.db.run(
            `INSERT INTO ${DB_TABLES.BOARDS} (id, owner, name, data) VALUES (?, ?, ?, ?)`,
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
boardRouter.get(API_BOARDS_ENDPOINTS.BOARD, async (ctx) => {
    try {
        const item = await ctx.state.db.get(
            `SELECT id, owner, name, thumbnail, created_at, updated_at FROM ${DB_TABLES.BOARDS} WHERE id = ? AND owner = ?`,
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
boardRouter.patch(API_BOARDS_ENDPOINTS.BOARD, async (ctx) => {
    const {name, thumbnail} = ctx.request.body;
    try {
        // Update the board with the provided data
        await ctx.state.db.run(
            `UPDATE ${DB_TABLES.BOARDS} SET name = ?, thumbnail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner = ?`,
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
boardRouter.delete(API_BOARDS_ENDPOINTS.BOARD, async (ctx) => {
    try {
        await ctx.state.db.run(
            `DELETE FROM ${DB_TABLES.BOARDS} WHERE id = ? AND owner = ?`,
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
boardRouter.get(API_BOARDS_ENDPOINTS.BOARD_DATA, async (ctx) => {
    try {
        const item = await ctx.state.db.get(
            `SELECT data FROM ${DB_TABLES.BOARDS} WHERE id = ? AND owner = ?`,
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
boardRouter.patch(API_BOARDS_ENDPOINTS.BOARD_DATA, async (ctx) => {
    try {
        await ctx.state.db.run(
            `UPDATE ${DB_TABLES.BOARDS} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner = ?`,
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
