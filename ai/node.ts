import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import { ENDPOINTS } from "./constants.ts";
import { generateElements } from "./handler.ts";
// import schema from "../schema/element.schema.json" with { type: "json" };
import { HTTP_CODES } from "../server/config.ts";
import { environment } from "../server/env.ts";
import { createLogger } from "../server/utils/logger.ts";
import { sendData, sendError } from "../server/utils/send.ts";

const DEFAULT_PORT = 8081;
// const DEFAULT_VERSION = "v1";

const { log, debug } = createLogger("folio:ai");

// run the server
const startServer = () => {
    // const version = environment.FOLIO_AI_VERSION || DEFAULT_VERSION;
    const port = environment.FOLIO_AI_PORT || DEFAULT_PORT;
    const app = new Koa();

    debug(`Starting folio-ai server at port ${port}`);

    // global handler
    app.use((context: Koa.Context, next: () => Promise<void>) => {
        return next().catch(error => {
            console.error(error);
            sendError(context, error.status || HTTP_CODES.INTERNAL_SERVER_ERROR, error.message || "");
        });
    });

    // register endpoints
    const router = new Router();
    router.get(ENDPOINTS.STATUS, async (context: Koa.Context) => {
        sendData(context, { message: "ok" });
    });
    router.post(ENDPOINTS.QUOTAS, async (context: Koa.Context) => {
        sendData(context, { requestsLimit: -1 });
    });
    router.post(ENDPOINTS.CHAT, async (context: Koa.Context) => {
        const { prompt } = ctx.request.body as { prompt: string };
        const apiKey = process.env.FOLIO_AI_GEMINI_APIKEY || process.env.GEMINI_API_KEY;
        const model = process.env.FOLIO_AI_GEMINI_MODEL || "gemini-2.0-flash";

        if (!apiKey) {
            ctx.status = 500;
            ctx.body = { error: "GEMINI_API_KEY not configured" };
            return;
        }

        if (!prompt) {
            ctx.status = 400;
            ctx.body = { error: "Prompt is required" };
            return;
        }

        try {
            const response = await generateElements(apiKey, prompt, schema, model);
            ctx.body = response;
        } catch (error) {
            console.error(error);
            sendError(context, HTTP_CODES.INTERNAL_SERVER_ERROR, error.message || "Error performing request");
        }
    });

    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    // start app
    app.listen(app, () => {
        log(`Server running at 'http://127.0.0.1:${port}'`);
        log(`Use Control-C to stop this server.`);
    });
};

startServer();
