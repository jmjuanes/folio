import fs from "node:fs";
import path from "node:path";
import Router from "@koa/router";
import type { ExtendedContext } from "../types/custom.ts";

// development router
export const developmentRouter = new Router();

// serve graphiql file
developmentRouter.get("/", (ctx: ExtendedContext) => {
    try {
        const filePath = path.resolve("server/public/graphiql.html");
        ctx.type = "html";
        ctx.body = fs.readFileSync(filePath, "utf8");
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = "Error loading GraphiQL";
    }
});
