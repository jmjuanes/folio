import Router from "@koa/router";
import { sendDataResponse } from "../utils/response.ts";

import type { Context } from "koa";

// status router
export const statusRouter = new Router();

// health check endpoint
statusRouter.get("/", (ctx: Context) => {
    sendDataResponse(ctx, {
        message: "ok",
    });
});
