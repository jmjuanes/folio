import Router from "@koa/router";
import type { Config } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";

// configuration router
export const configRouter = new Router();

// endpoint to get the website configuration from server
configRouter.get("/", (ctx: ExtendedContext) => {
    const config = ctx.state.config as Config;

    ctx.ok({
        data: {
            ...config.app_config,
        },
    });
});
