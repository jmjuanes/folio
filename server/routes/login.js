import Router from "koa-router";
import {API_LOGIN_ENDPOINTS} from "../config.js";
import {ACCESS_TOKEN, generateJwtToken} from "../token.js";

export const loginRouter = new Router();

// GET - login route
loginRouter.get(API_LOGIN_ENDPOINTS.LOGIN, (ctx) => {
    ctx.sendError(ctx, 405, "Method Not Allowed. Use POST to login.");
});

// POST - login route
loginRouter.post(API_LOGIN_ENDPOINTS.LOGIN, async (ctx) => {
    const {token} = ctx.request.body;
    if (!token) {
        return ctx.sendError(ctx, 400, "Token is required");
    }
    // Compare with the access token generated at server start
    if (token !== ACCESS_TOKEN) {
        return ctx.sendError(ctx, 401, "Invalid token");
    }
    // Generate JWT token for API access
    const jwtToken = generateJwtToken({
        user: "folio",
    });
    ctx.body = {
        message: "ok",
        token: jwtToken,
    };
});
