import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import Router from "@koa/router";
import { WebsiteEnvironment } from "../config.ts";
import type { Config } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";

// configuration router
export const configRouter = new Router();

// endpoint to get the website configuration from server
configRouter.get("/", async (ctx: ExtendedContext) => {
    const config = ctx.state.config as Config;

    // profile data
    let profile: any = {};

    // load profile configuration
    if (config?.profile) {
        const profilePath = path.resolve(process.cwd(), "profiles", `${config.profile}.json`);
        if (existsSync(profilePath)) {
            try {
                const profileStr = await fs.readFile(profilePath, "utf8");
                profile = JSON.parse(profileStr);
            }
            catch (error) {
                console.warn(`[folio:server] Warning: profile '${config.profile}' not found or invalid.`);
            }
        }
    }

    ctx.ok({
        data: {
            title: config.website_title || profile?.title || "",
            logo: config.website_logo || profile?.logo || "",
            favicon: config.website_favicon || profile?.favicon || "",
            environment: config.website_environment || WebsiteEnvironment.PRODUCTION,
            hide_experimental_warning: config.website_hide_experimental_warning ?? false,
            preferences: profile?.preferences || {},
        },
    });
});
