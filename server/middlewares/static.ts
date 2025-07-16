import { send } from "@koa/send";
import { ExtendedContext } from "../types/commons";

// middleware to serve static files from www folder
export const staticContent = (options: any = {}) => {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
        await next();
        // if the response is already set, skip serving static files
        if (ctx.body || ctx.status !== 404) {
            return;
        }
        // if the request is for an API endpoint, skip serving static files
        // if (ctx.path.startsWith(ENDPOINTS.API)) {
        //     return;
        // }
        await send(ctx, ctx.path, {
            root: options.directory,
            index: options.index || "index.html",
        });
    };
};
