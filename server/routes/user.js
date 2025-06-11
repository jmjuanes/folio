import Router from "koa-router";
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
