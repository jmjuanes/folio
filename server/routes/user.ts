import Router from "@koa/router";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import { authentication } from "../middlewares/authentication.ts";
import { createLogger } from "../utils/logger.ts";
import { sendDataResponse, sendErrorResponse } from "../utils/response.ts";
import type { ExtendedContext } from "../types/custom.ts";

export const userRouter = new Router();

const log = createLogger("folio:route:user");

userRouter.use(authentication);

// GET / - obtain information about authenticated user
userRouter.get("/", async (ctx: ExtendedContext) => {
    try {
        const authenticatedUser = await ctx.state.auth.getUser(ctx.state.username);
        sendDataResponse(ctx, authenticatedUser);
    }
    catch (error: any) {
        log.error(`error getting authenticated user ${ctx.state.username}: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// GET /preferences - get user preferences for editor
userRouter.get("/preferences", async (ctx: ExtendedContext) => {
    // const { query, variables } = ctx.request.body as any;
    try {
        const userPreferences = await ctx.state.auth.getUserPreferences(ctx.state.username);
        sendDataResponse(ctx, userPreferences);
    }
    catch (error: any) {
        log.error(`error getting user preferences: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// POST /preferences - update user preferences
userRouter.post("/preferences", async (ctx: ExtendedContext) => {
    const preferences = ctx.request.body as any || {};
    try {
        await ctx.state.auth.updateUserPreferences(ctx.state.username, preferences);
        sendDataResponse(ctx, {
            message: "Preferences updated.",
        });
    }
    catch (error: any) {
        log.error(`error updating user preferences: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});
