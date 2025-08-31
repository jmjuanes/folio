import Router from "@koa/router";
import { createLogger } from "../utils/logger.ts";
import { authentication } from "../middlewares/authentication.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { UserPayload } from "../types/authentication.ts";
import type { User } from "../types/user.ts";

const log = createLogger("folio:route:user");
export const userRouter = new Router();

// accessing user routes requires authentication
userRouter.use(authentication);

// GET / --> get information about the authenticated user
userRouter.get("/", async (ctx: ExtendedContext) => {
    try {
        const user = await ctx.state.auth.getUser(ctx.state.user) as User;
        return ctx.ok({
            data: user,
        });
    } catch (error) {
        log.error(`error getting user information: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// PATCH / --> update information about the authenticated user
userRouter.patch("/", async (ctx: ExtendedContext) => {
    // const data: UserPayload = ctx.request.body;
    ctx.error(HTTP_CODES.METHOD_NOT_ALLOWED, API_ERROR_MESSAGES.NOT_IMPLEMENTED);
});
