import Router from "@koa/router";
import { ExtendedContext } from "../types/commons";

// status router
export const statusRouter = new Router();

// health check endpoint
statusRouter.get("/", (ctx: ExtendedContext) => {
    ctx.ok({
        message: "ok",
    });
});
