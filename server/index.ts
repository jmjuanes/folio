import path from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import cors from "@koa/cors";
// import helmet from "koa-helmet";
import { API_ERROR_MESSAGES, HTTP_CODES } from "./constants.ts";
import { createStore } from "./storage/index.ts";
import { createAuth } from "./auth/index.ts";
import { logger } from "./middlewares/logger.ts";
import { staticContent } from "./middlewares/static.ts";
import { loginRouter } from "./routes/login.ts";
import { statusRouter } from "./routes/status.ts";
import { graphqlRouter } from "./routes/graphql.ts";
import { createLogger } from "./utils/logger.ts";
import type { Config, SecurityConfig, WebsiteConfig } from "./config.ts";

const DEFAULT_PORT = 8080;

const { log, debug } = createLogger("folio:server");

// run the server
export const startServer = async (config: Config): Promise<any> => {
    const port = config.port || DEFAULT_PORT;
    const app = new Koa();
    const store = await createStore(config);
    const auth = await createAuth(config);

    debug(`Starting server at port ${port}...`);

    // register custom methods to send responses
    app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
        // send a response with a status code and body content
        ctx.send = (status: number, bodyContent: object = {}) => {
            ctx.status = status;
            ctx.body = bodyContent;
        };

        // to avoid adding the 200 status code to every response, we can use ctx.ok instead
        ctx.ok = (bodyContent: object = {}) => {
            ctx.send(HTTP_CODES.OK, bodyContent);
        };

        // include server state in the context
        ctx.state.store = store;
        ctx.state.auth = auth;
        ctx.state.config = config;
        ctx.state.username = null;

        // global error handler
        try {
            await next();
        }
        catch (error) {
            console.error(error);
            ctx.send(error.status || HTTP_CODES.INTERNAL_SERVER_ERROR, {
                errors: [
                    error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                ],
            });
        }
    });

    // register security middlewares
    const securityConfig = config?.security as SecurityConfig;
    // app.use(helmet({
    //     contentSecurityPolicy: false,
    // }));
    if (securityConfig?.cors) {
        debug("Enabling CORS...");
        app.use(cors({
            origin: securityConfig?.cors_origin || "*",
            allowMethods: securityConfig?.cors_allowed_methods || "GET,POST",
        }));
    }

    // register utility and parser middlewares
    app.use(bodyParser());
    app.use(logger());

    // website configuration
    const websiteConfig = config?.website as WebsiteConfig;
    if (!websiteConfig?.enabled === false) {
        const websiteDirectory = path.resolve(websiteConfig?.directory || "./app");
        debug(`Website is enabled. Reading content from ${websiteDirectory}`);
        app.use(staticContent({
            // directory: path.resolve(websiteConfig?.directory || "app"),
            directory: websiteDirectory,
            index: websiteConfig?.index || "app.html",
        }));
    }

    // create app routes
    const router = new Router();
    router.use("/_login", loginRouter.routes(), loginRouter.allowedMethods());
    router.use("/_status", statusRouter.routes(), statusRouter.allowedMethods());
    router.use("/_graphql", graphqlRouter.routes(), graphqlRouter.allowedMethods());

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
