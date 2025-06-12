import Router from "koa-router";
import {authenticateToken} from "../middleware/authentication.js";

export const librariesRouter = new Router();

// Apply authentication middleware to all routes
librariesRouter.use(authenticateToken);

// GET - list all available libraries
librariesRouter.get("/", async (ctx) => {
    ctx.sendError(ctx, 404, "Not implemented yet.");
});
