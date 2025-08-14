import Router from "@koa/router";
import { WEB_TITLE, WebsiteEnvironment} from "../config.ts";
import type { Config } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";

// configuration router
export const configRouter = new Router();

// endpoint to get the website configuration from server
configRouter.get("/", (ctx: ExtendedContext) => {
    const config = ctx.state.config as Config;

    ctx.ok({
        data: {
            title: config.website_title || WEB_TITLE,
            logo: config.website_logo,
            favicon: config.website_favicon,
            environment: config.website_environment || WebsiteEnvironment.PRODUCTION,
            hide_experimental_warning: config.website_hide_experimental_warning ?? false,
        },
    });
});
