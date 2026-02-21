import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import { ENDPOINTS, API_ERROR_MESSAGES } from "./constants.ts";
import { HTTP_CODES } from "../server/config.ts";
import { environment } from "../server/env.ts";
import { createLogger } from "../server/utils/logger.ts";
import { sendData, sendError } from "../server/utils/send.ts";
import { generateChatMessage } from "./handler.ts";

const DEFAULT_PORT = 8081;
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
// const DEFAULT_VERSION = "v1";

const { log, debug, error } = createLogger("folio:ai");

// run the server
const startAiServer = () => {
    // const version = environment.FOLIO_AI_VERSION || DEFAULT_VERSION;
    const port = environment.FOLIO_AI_PORT || DEFAULT_PORT;
    const model = environment.FOLIO_AI_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const apiKey = environment.FOLIO_AI_GEMINI_APIKEY;
    const app = new Koa();

    debug(`Starting folio-ai server at port ${port}`);
    if (!apiKey) {
        error(`Error starting folio-ai server. FOLIO_AI_GEMINI_APIKEY is not configured.`);
        return process.exit(1);
    }

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
    router.post(ENDPOINTS.CHAT_MESSAGE, async (context: Koa.Context) => {
        const { prompt, history } = ctx.request.body as { prompt: string, history?: any };
        const apiKey = process.env.FOLIO_AI_GEMINI_APIKEY || process.env.GEMINI_API_KEY;
        const model = process.env.FOLIO_AI_GEMINI_MODEL || "gemini-2.0-flash";
        // generate chat message

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
        } catch (responseError) {
            console.error(responseError);
            sendError(context, HTTP_CODES.INTERNAL_SERVER_ERROR, responseError.message || API_ERROR_MESSAGES.ERROR_PERFORMING_REQUEST);
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

startAiServer();
