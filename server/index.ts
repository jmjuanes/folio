import path from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import cors from "@koa/cors";
import { createStore } from "./storage.ts";
import { createAuth } from "./authentication.ts";
import { logger } from "./middlewares/logger.ts";
import { loginRouter } from "./routes/login.ts";
import { statusRouter } from "./routes/status.ts";
import { configRouter } from "./routes/config.ts";
import { documentsRouter } from "./routes/documents.ts";
import { createLogger } from "./utils/logger.ts";
import { sendErrorResponse } from "./utils/response.ts";
import type { Context } from "koa";
import type { Config } from "./config.ts";

const { log, debug } = createLogger("folio:server");

// run the server
export const startServer = async (config: Config): Promise<any> => {
    const port = config.port;
    const app = new Koa();
    const store = await createStore(config);
    const auth = await createAuth(config);

    debug(`Starting server at port ${port}...`);

    // register custom methods to send responses
    app.use(async (ctx: Context, next: () => Promise<void>) => {
        // include server state in the context
        ctx.state.storage = store;
        ctx.state.auth = auth;
        ctx.state.config = config;
        ctx.state.username = null;

        // global error handler
        try {
            await next();
        }
        catch (error: any) {
            console.error(error);
            // ctx.error(error.status || HTTP_CODES.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            // check for application error
            if (typeof error?.statusCode === "number") {
                return sendErrorResponse(ctx, error.statusCode, error.message);
            }
            // general internal server error
            return sendErrorResponse(ctx, 500, error?.message || "Internal Server Error");
        }
    });

    if (config?.cors) {
        debug("Enabling CORS...");
        app.use(cors({
            origin: config.cors_origin || "*",
            allowMethods: config?.cors_allowed_methods || "GET,POST",
        }));
    }

    // register utility and parser middlewares
    app.use(bodyParser());
    app.use(logger());

    // create app routes
    const router = new Router();
    router.use("/_login", loginRouter.routes(), loginRouter.allowedMethods());
    router.use("/_config", configRouter.routes(), configRouter.allowedMethods());
    router.use("/_status", statusRouter.routes(), statusRouter.allowedMethods());
    router.use("/_documents", documentsRouter.routes(), documentsRouter.allowedMethods());

    // register all routes
    app.use(router.routes());
    app.use(router.allowedMethods());

    // start the server
    app.listen(port, () => {
        log(`Server running at 'http://127.0.0.1:${port}'`);
        log(`Use Control-C to stop this server.`);
    });

    return app;
};
