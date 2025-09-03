import Router from "@koa/router";
import type { ExtendedContext } from "../types/custom.ts";

// status router
export const statusRouter = new Router();

// health check endpoint
statusRouter.get("/", (ctx: ExtendedContext) => {
    ctx.ok({
        data: {
            message: "ok",
        },
    });
});
