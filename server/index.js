import Koa from "koa";
import Router from "koa-router";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import cors from "@koa/cors";
import {logger} from "./middleware/logger.js";
import {boardRouter} from "./routes/board.js";
import {loginRouter} from "./routes/login.js";
import {userRouter} from "./routes/user.js";
import {ACCESS_TOKEN} from "./token.js";
import {PORT, WWW_PATH, API_ENDPOINTS} from "./config.js";

const app = new Koa();

// define utility methods in app 
app.context.sendError = (ctx, status, message) => {
    ctx.status = status;
    ctx.body = {
        message: message || "An error occurred",
        status: status.toString(),
    };
};

// get server URL
app.context.getUrl = (directory = "") => {
    return `http://127.0.0.1:${PORT}${directory}`;
};

// Global error handler
app.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (error) {
        console.error(error);
        ctx.sendError(ctx, error.status || 500, error.message || "Internal Server Error");
    }
});

// Register middlewares
app.use(logger()); // Custom logger middleware
app.use(helmet()); // Security headers
app.use(bodyParser()); // Parse JSON request bodies
app.use(cors({
    // origin: () => {
    //     return process.env?.NODE_ENV === "development" ? "*" : ""; // allow all origins in development
    // },
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Serve static files from www folder
app.use(serve(WWW_PATH, {
    index: "index.html", // default file to serve
}));

// Root router
const router = new Router();

// api main entrypoint
router.get(API_ENDPOINTS.API, ctx => {
    ctx.body = {
        status_url: ctx.getUrl(API_ENDPOINTS.STATUS),
        boards_url: ctx.getUrl(API_ENDPOINTS.BOARDS),
        user_url: ctx.getUrl(API_ENDPOINTS.USER),
        login_url: ctx.getUrl(API_ENDPOINTS.LOGIN),
    };
});

// Health check endpoint
router.get(API_ENDPOINTS.STATUS, ctx => {
    ctx.body = {
        message: "ok",
    };
});

// API Routes
router.use(API_ENDPOINTS.LOGIN, loginRouter.routes(), loginRouter.allowedMethods());
router.use(API_ENDPOINTS.USER, userRouter.routes(), userRouter.allowedMethods());
router.use(API_ENDPOINTS.BOARDS, boardRouter.routes(), boardRouter.allowedMethods());

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
