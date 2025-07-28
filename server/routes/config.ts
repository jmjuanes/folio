import Router from "@koa/router";
import { WEB_TITLE } from "../config.ts";
import type { WebsiteConfig, WebsiteEnvironment } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";

// configuration router
export const configRouter = new Router();

// endpoint to get the website configuration from server
configRouter.get("/", (ctx: ExtendedContext) => {
    const config = ctx.state.config?.website || {} as WebsiteConfig;

    ctx.ok({
        data: {
            title: config.title || WEB_TITLE,
            logo: config.logo,
            favicon: config.favicon,
            environment: (config.environment || "production") as WebsiteEnvironment,
            show_experimental_warnings: true,
        },
    });
});
