import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import cors from "@koa/cors";
import { send } from "@koa/send";
import helmet from "koa-helmet";
import { logger } from "./middlewares/logger.js";
import { loginRouter } from "./routes/login.js";
import { boardsRouter } from "./routes/boards.js";
import { propertiesRouter } from "./routes/properties.js";
import { userRouter } from "./routes/user.js";
import { ACCESS_TOKEN } from "./token.js";
import { PORT, WWW_PATH, API_PATH, API_ENDPOINTS } from "./config.js";

const app = new Koa();

// get server URL
app.context.getUrl = (directory = "") => {
    return `http://127.0.0.1:${PORT}${directory}`;
};

// register custom methods to send responses
app.use(async (ctx, next) => {
    // send a response with a status code and body content
    ctx.send = (status = 200, bodyContent = {}) => {
        ctx.status = status;
        ctx.body = bodyContent;
    };
    // to avoid adding the 200 status code to every response, we can use ctx.ok instead
    ctx.ok = (bodyContent = {}) => ctx.send(200, bodyContent);
    await next();
});

// Global error handler
app.use(async (ctx, next) => {
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

// Register middlewares
app.use(logger()); // Custom logger middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(bodyParser()); // Parse JSON request bodies
app.use(cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Serve static files from www folder
app.use(async (ctx, next) => {
    await next();
    // if the response is already set, skip serving static files
    if (ctx.body || ctx.status !== 404) {
        return;
    }
    // if the request is for an API endpoint, skip serving static files
    if (ctx.path.startsWith(API_PATH)) {
        return;
    }
    await send(ctx, ctx.path, {
        root: WWW_PATH,
        index: "index.html",
    });
});

// Root router
const router = new Router();

// api main entrypoint
router.get(API_ENDPOINTS.API, ctx => {
    return ctx.ok({
        status_url: ctx.getUrl(API_ENDPOINTS.STATUS),
        boards_url: ctx.getUrl(API_ENDPOINTS.BOARDS),
        properties_url: ctx.getUrl(API_ENDPOINTS.PROPERTIES),
        search_url: ctx.getUrl(API_ENDPOINTS.SEARCH),
        user_url: ctx.getUrl(API_ENDPOINTS.USER),
        login_url: ctx.getUrl(API_ENDPOINTS.LOGIN),
    });
});

// Health check endpoint
router.get(API_ENDPOINTS.STATUS, ctx => {
    return ctx.ok({
        message: "ok",
    });
});

// API Routes
router.use(API_ENDPOINTS.LOGIN, loginRouter.routes(), loginRouter.allowedMethods());
router.use(API_ENDPOINTS.USER, userRouter.routes(), userRouter.allowedMethods());
router.use(API_ENDPOINTS.BOARDS, boardsRouter.routes(), boardsRouter.allowedMethods());
router.use(API_ENDPOINTS.PROPERTIES, propertiesRouter.routes(), propertiesRouter.allowedMethods());

// Register all routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(PORT, () => {
    console.log(`[folio:server] Server running at ${app.context.getUrl("")}`);
    console.log(`[folio:server] API available at ${app.context.getUrl(API_ENDPOINTS.API)}`);
    console.log(`[folio:server] API Status available at ${app.context.getUrl(API_ENDPOINTS.STATUS)}`);
    console.log(`[folio:server] Use Control-C to stop this server.`);
    console.log(`[folio:server] ======= AUTHENTICATION ========`);
    console.log(`[folio:server] Access Token: ${ACCESS_TOKEN}`);
    console.log(`[folio:server] Use this token to login at POST ${API_ENDPOINTS.LOGIN}`);
    console.log(`[folio:server] ===============================`);
});
