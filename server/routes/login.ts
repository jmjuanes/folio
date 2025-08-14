import Router from "@koa/router";
import { generateJwtToken } from "../token.ts";
import { createLogger } from "../utils/logger.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { Config } from "../config.ts";
import type { User } from "../types/user.ts";

const log = createLogger("folio:route:login");
export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async (ctx: ExtendedContext) => {
    ctx.error(HTTP_CODES.METHOD_NOT_ALLOWED, API_ERROR_MESSAGES.METHOD_NOT_ALLOWED);
});

// POST - login route
loginRouter.post("/", async (ctx: ExtendedContext) => {
    const config = ctx.state.config as Config;

    // pass the request body object to the authenticate method
    // it should return the user information of the user, or null
    try {
        const payload: User|null = await ctx.state.auth.authenticate(ctx.request.body);
        if (!payload) {
            return ctx.error(HTTP_CODES.UNAUTHORIZED, API_ERROR_MESSAGES.INVALID_TOKEN);
        }

        // generate the JWT token for API access and return it as part 
        // of the response object
        return ctx.ok({
            data: {
                token: generateJwtToken({
                    secret: config?.jwt_token_secret,
                    expiration: config?.jwt_token_expiration,
                    payload: {
                        username: payload.username,
                    },
                }),
            },
        });
    }
    catch (error) {
        log.error(`error authenticating user: '${error.message}'`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});
