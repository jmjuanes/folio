import path from "node:path";
import Koa from "koa";
import Router from "koa-router";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import {logger} from "./middleware/logger.js";
import {boardRouter} from "./routes/board.js";
import {loginRouter} from "./routes/login.js";
import {userRouter} from "./routes/user.js";
import environment from "./utils/environment.js";
import {ACCESS_TOKEN} from "./utils/token.js";

// Initialize Koa app
const app = new Koa();
const PORT = environment.PORT || 4000;
const STATIC_PATH = path.resolve(process.cwd(), "../www");

// define utility methods in app 
app.context.sendError = (ctx, status, message) => {
    ctx.status = status;
    ctx.body = {
        message: message || "An error occurred",
        status: status.toString(),
    };
};

// get server URL
const getServerUrl = directory => {
    return `http://127.0.0.1:${PORT}/${directory}`;
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

// Serve static files from www folder
app.use(serve(STATIC_PATH));

// Root router
const router = new Router();

// api entry point
router.get("/api", ctx => {
    ctx.body = {
        status_url: getServerUrl("api/status"),
        boards_url: getServerUrl("api/boards"),
        user_url: getServerUrl("api/user"),
        login_url: getServerUrl("api/login"),
    };
});

// Health check endpoint
router.get("/api/status", ctx => {
    ctx.body = {
        message: "ok",
    };
});

// API Routes
router.use("/api/login", loginRouter.routes(), loginRouter.allowedMethods());
router.use("/api/user", userRouter.routes(), userRouter.allowedMethods());
router.use("/api/boards", boardRouter.routes(), boardRouter.allowedMethods());

// Register all routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(PORT, () => {
    console.log(`[folio:server] Server running at ${getServerUrl("")}`);
    console.log(`[folio:server] API available at ${getServerUrl("api/")}`);
    console.log(`[folio:server] API Status available at ${getServerUrl("api/status")}`);
    console.log(`[folio:server] Use Control-C to stop this server.`);
    // console.log(`[folio:server] Static files served from: ${""}`);
    console.log(`[folio:server] ======= AUTHENTICATION ========`);
    console.log(`[folio:server] Access Token: ${ACCESS_TOKEN}`);
    console.log(`[folio:server] Use this token to login at POST /api/login`);
    console.log(`[folio:server] ===============================`);
    console.log(`\n`);
});
