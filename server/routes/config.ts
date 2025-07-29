import Router from "@koa/router";
import { WEB_TITLE, WebsiteEnvironment} from "../config.ts";
import type { WebsiteConfig } from "../config.ts";
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
            environment: config.environment || WebsiteEnvironment.PRODUCTION,
            hide_experimental_warning: config.hide_experimental_warning ?? false,
        },
    });
});
