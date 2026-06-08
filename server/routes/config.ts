import Router from "@koa/router";
import { sendDataResponse } from "../utils/response.ts";
import type { Config } from "../config.ts";
import type { Context } from "koa";

// configuration router
export const configRouter = new Router();

// endpoint to get the website configuration from server
configRouter.get("/", (ctx: Context) => {
    const config = ctx.state.config as Config;

    sendDataResponse(ctx, {
        ...config.app_config,
    });
});
