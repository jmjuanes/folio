import { send } from "@koa/send";
import { HTTP_CODES, API_ERROR_MESSAGES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";

// middleware to serve static files from www folder
export const staticContent = (options: any = {}) => {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
        await next();

        // if the response is already set, skip serving static files
        if (ctx.body || ctx.status !== HTTP_CODES.NOT_FOUND) {
            return;
        }

        // if the request is for an API endpoint, skip serving static files
        if (ctx.path.startsWith("_") || ctx.path.startsWith("/_")) {
            return;
        }

        // if the request is for a file in the www directory, serve it
        try {
            await send(ctx, ctx.path, {
                root: options.directory,
                index: options.index || "index.html",
            });
        }
        catch (error) {
            ctx.send(HTTP_CODES.NOT_FOUND, {
                errors: [
                    API_ERROR_MESSAGES.NOT_FOUND,
                ],
            });
        }
    };
};
