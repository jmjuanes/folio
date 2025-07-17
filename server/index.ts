import path from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import { createLocalStore } from "./storage/local.ts";
import { logger } from "./middlewares/logger.ts";
import { staticContent } from "./middlewares/static.ts";
import { loginRouter } from "./routes/login.ts";
import { statusRouter } from "./routes/status.ts";
import { graphqlRouter } from "./routes/graphql.ts";
import type { Config } from "./types/config.ts";

const DEFAULT_PORT = 8080;

// get server URL
const getUrl = (port: number, directory: string = ""): string => {
    return `http://127.0.0.1:${port}${directory}`;
};

// run the server
export const startServer = async (config: Config): Promise<any> => {
    const port = config.port || DEFAULT_PORT;
    const app = new Koa();
    const store = await createLocalStore(config);

    // register custom methods to send responses
    app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
        // send a response with a status code and body content
        ctx.send = (status: number = 200, bodyContent: object = {}) => {
            ctx.status = status;
            ctx.body = bodyContent;
        };
        // to avoid adding the 200 status code to every response, we can use ctx.ok instead
        ctx.ok = (bodyContent: object = {}) => {
            ctx.send(200, bodyContent);
        };
        // include server state in the context
        ctx.state.store = store;
        ctx.state.config = config;
        // global error handler
        try {
            await next();
        }
        catch (error) {
            console.error(error);
            ctx.send(error.status || 500, {
                message: error.message || "Internal Server Error",
            });
        }
    });

    // register security middlewares
    // app.use(helmet({
    //     contentSecurityPolicy: false,
    // }));

    // register utility and parser middlewares
    app.use(bodyParser());
    app.use(logger());
    app.use(staticContent({
        directory: path.resolve(config.wwwPath),
        index: "index.html",
    }));

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
        console.log(`[folio:server] Server running at ${getUrl(port, "")}`);
        // console.log(`[folio:server] API Status available at ${getUrl(port, STATUS_API_ENDPOINTS.status)}`);
        console.log(`[folio:server] Use Control-C to stop this server.`);
        // console.log(`[folio:server] ======= AUTHENTICATION ========`);
        // console.log(`[folio:server] Access Token: ${ACCESS_TOKEN}`);
        // console.log(`[folio:server] Use this token to login at POST ${ENDPOINTS.LOGIN}`);
        // console.log(`[folio:server] ===============================`);
    });

    return app;
};
