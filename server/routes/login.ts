import Router from "@koa/router";
import { generateJwtToken } from "../token.ts";
import { createLogger } from "../utils/logger.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { SecurityConfig } from "../config.ts";
import type { User } from "../types/user.ts";

const log = createLogger("folio:route:login");
export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async (ctx: ExtendedContext) => {
    return ctx.send(HTTP_CODES.METHOD_NOT_ALLOWED, {
        message: API_ERROR_MESSAGES.METHOD_NOT_ALLOWED,
    });
});

// POST - login route
loginRouter.post("/", async (ctx: ExtendedContext) => {
    const securityConfig = ctx.state.config?.security as SecurityConfig;

    // pass the request body object to the authenticate method
    // it should return the user information of the user, or null
    try {
        const payload: User|null = await ctx.state.auth.authenticate(ctx.request.body);
        if (!payload) {
            return ctx.send(HTTP_CODES.UNAUTHORIZED, {
                message: API_ERROR_MESSAGES.INVALID_TOKEN,
            });
        }

        // generate the JWT token for API access and return it as part 
        // of the response object
        return ctx.ok({
            token: generateJwtToken({
                secret: securityConfig?.jwt_token_secret,
                expiration: securityConfig?.jwt_token_expiration,
                payload: payload,
            }),
        });
    }
    catch (error) {
        log.error(`error authenticating user: '${error.message}'`);
        return ctx.send(HTTP_CODES.INTERNAL_SERVER_ERROR, {
            message: API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
