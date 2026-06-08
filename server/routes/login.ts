import Router from "@koa/router";
import { generateJwtToken } from "../token.ts";
import { InternalServerError, MethodNotAllowedError, UnauthorizedError } from "../errors.ts";
import { createLogger } from "../utils/logger.ts";
import { sendDataResponse } from "../utils/response.ts";
import type { Context } from "koa";
import type { Config } from "../config.ts";

const log = createLogger("folio:route:login");

export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async () => {
    throw new MethodNotAllowedError();
});

// POST - login route
loginRouter.post("/", async (ctx: Context) => {
    const config = ctx.state.config as Config;

    // pass the request body object to the authenticate method
    // it should return the user information of the user, or null
    try {
        const username: string|null = await ctx.state.auth.authenticate(ctx.request.body);
        if (!username) {
            throw new UnauthorizedError();
        }

        // generate the JWT token for API access and return it as part 
        // of the response object
        const token = generateJwtToken({ username: username }, config?.jwt_token_secret, config?.jwt_token_expiration);
        return sendDataResponse(ctx, { token: token });
    }
    catch (error: any) {
        log.error(`error authenticating user: '${error.message}'`);
        throw new InternalServerError("Error authenticating user");
    }
});
