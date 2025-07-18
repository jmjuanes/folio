import Router from "@koa/router";
import { generateJwtToken, hashToken } from "../token.ts";
import { Collections } from "../types/storage.ts";
import type { ExtendedContext } from "../types/custom.ts";

export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async (ctx: ExtendedContext) => {
    return ctx.send(405, {
        message: "Method Not Allowed. Use POST to login.",
    });
});

// POST - login route
loginRouter.post("/", async (ctx: ExtendedContext) => {
    const { token } = ctx.request.body;
    if (!token) {
        return ctx.send(400, {
            message: "Token is required",
        });
    }
    // check if we have a user with this access token
    try {
        const hashedToken = await hashToken(token, ctx.state.config?.secret);
        const allTokens = await ctx.state.store.getAll(Collections.ACCESS_TOKEN);
        const tokenExists = allTokens.some((response: any) => {
            return JSON.parse(response.content)?.token === hashedToken;
        });
        const user = await ctx.state.store.getToken(null, token);
        // if no user is found, return 401 Unauthorized
        if (!user) {
            return ctx.send(401, {
                message: "Invalid token",
            });
        }
        // generate the JWT token for API access and return it as part 
        // of the response object
        return ctx.ok({
            message: "ok",
            token: generateJwtToken({
                secret: ctx.state.config?.tokenSecret,
                expiration: ctx.state.config?.tokenExpiration,
                payload: {
                    userId: user.user,
                },
            }),
        });
    }
    catch (error) {
        return ctx.send(500, {
            message: "Internal Server Error",
        });
    }
});
