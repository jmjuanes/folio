import Router from "koa-router";
import {ACCESS_TOKEN, generateJwtToken} from "../utils/token.js";

export const loginRouter = new Router();

// POST - login route
loginRouter.post("/", async (ctx) => {
    const {token} = ctx.request.body;
    if (!token) {
        return ctx.sendError(ctx, 400, "Token is required");
    }
    // Compare with the access token generated at server start
    if (token !== ACCESS_TOKEN) {
        return ctx.sendError(ctx, 401, "Invalid token");
    }
    // Generate JWT token for API access
    const jwtToken = generateJwtToken();
    ctx.body = {
        message: "ok",
        token: jwtToken,
    };
});
