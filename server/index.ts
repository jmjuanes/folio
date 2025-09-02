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
import { configRouter } from "./routes/config.ts";
// import { graphqlRouter } from "./routes/graphql.ts";
import { documentsRouter } from "./routes/documents.ts";
import { userRouter } from "./routes/user.ts";
// import { developmentRouter } from "./routes/dev.ts";
import { createLogger } from "./utils/logger.ts";
import { WebsiteEnvironment, type Config } from "./config.ts";

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

        // send an error message with a status code
        ctx.error = (status: number, messageText: string) => {
            ctx.send(status, {
                errors: [
                    { message: messageText },
                ],
            });
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
            ctx.error(error.status || HTTP_CODES.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    });

    // app.use(helmet({
    //     contentSecurityPolicy: false,
    // }));
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

    // website configuration
    if (!config?.website === false) {
        const websiteDirectory = path.resolve(config.website_directory || "./app");
        debug(`Website is enabled. Reading content from ${websiteDirectory}`);
        app.use(staticContent({
            directory: websiteDirectory,
            index: config.website_index || "app.html",
        }));
    }

    // create app routes
    const router = new Router();
    router.use("/_login", loginRouter.routes(), loginRouter.allowedMethods());
    router.use("/_config", configRouter.routes(), configRouter.allowedMethods());
    router.use("/_status", statusRouter.routes(), statusRouter.allowedMethods());
    router.use("/_documents", documentsRouter.routes(), documentsRouter.allowedMethods());
    router.use("/_user", userRouter.routes(), userRouter.allowedMethods());
    // router.use("/_graphql", graphqlRouter.routes(), graphqlRouter.allowedMethods());

    // enable development route
    // if (config?.website_environment === WebsiteEnvironment.DEVELOPMENT) {
    //     router.use("/_dev", developmentRouter.routes(), developmentRouter.allowedMethods());
    // }

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
