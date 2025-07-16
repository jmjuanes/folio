import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import { ACCESS_TOKEN, generateJwtToken } from "./token";
import { PORT, WWW_PATH, ENDPOINTS } from "./env";
import { schema } from "./graphql";
import { createDatabase } from "./database";
import { logger } from "./middlewares/logger";
import { staticContent } from "./middlewares/static";
import { loginRouter } from "./routes/login";
import { statusRouter } from "./routes/status";
import {
    LOGIN_API_ENDPOINTS,
    STATUS_API_ENDPOINTS,
    GRAPHQL_API_ENDPOINTS,
} from "./config";

// get server URL
const getUrl = (directory: string = ""): string => {
    return `http://127.0.0.1:${PORT}${directory}`;
};

// run the server
export const startServer = async (): Promise<any> => {
    const app = new Koa();
    const db = await createDatabase();
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
        // register the database instance in the context state
        ctx.state.db = db;
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
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    // register utility and parser middlewares
    app.use(bodyParser());
    app.use(logger());
    app.use(staticContent({
        directory: WWW_PATH,
        index: "index.html",
    }));
    // create app routes
    const router = new Router();
    router.use(LOGIN_API_ENDPOINTS.login, loginRouter.routes(), loginRouter.allowedMethods());
    router.use(STATUS_API_ENDPOINTS.status, statusRouter.routes(), statusRouter.allowedMethods());
    // register all routes
    app.use(router.routes());
    app.use(router.allowedMethods());
    // start the server
    app.listen(PORT, () => {
        console.log(`[folio:server] Server running at ${getUrl("")}`);
        console.log(`[folio:server] API available at ${getUrl(ENDPOINTS.API)}`);
        console.log(`[folio:server] API Status available at ${getUrl(ENDPOINTS.STATUS)}`);
        console.log(`[folio:server] Use Control-C to stop this server.`);
        console.log(`[folio:server] ======= AUTHENTICATION ========`);
        console.log(`[folio:server] Access Token: ${ACCESS_TOKEN}`);
        console.log(`[folio:server] Use this token to login at POST ${ENDPOINTS.LOGIN}`);
        console.log(`[folio:server] ===============================`);
    });
    return app;
};

// start the server
// graphql({schema, source: query, variableValues: {ids: ["a", "b"]}}).then((response) => {
//     console.log(JSON.stringify(response, null, 4));
// }).catch((error) => {
//     console.error("Error executing GraphQL query:", error);
// });
