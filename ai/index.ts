import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import { ENDPOINTS, API_ERROR_MESSAGES } from "./constants.ts";
import { HTTP_CODES } from "../server/constants.ts";
import { createLogger } from "../server/utils/logger.ts";
import { sendData, sendError } from "../server/utils/send.ts";
import { createAssistant } from "./ai.ts";
import type { Config } from "../server/config.ts";

const DEFAULT_PORT = 8081;
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const { log, debug, error } = createLogger("folio:ai");

// run the server
export const startAiServer = async (config: Config): Promise<any> => {
    const port = config.ai_port || DEFAULT_PORT;
    const app = new Koa();

    debug(`Starting folio-ai server at port ${port}`);
    if (!config.ai_apikey) {
        error(`Error starting folio-ai server. FOLIO_AI_APIKEY is not configured.`);
        return process.exit(1);
    }

    // initialize the ai assistant
    const assistant = createAssistant({
        baseUrl: config.ai_base_url,
        apiKey: config.ai_apikey,
        model: config.ai_model || DEFAULT_MODEL,
    });

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
    router.post(ENDPOINTS.GENERATE_ELEMENTS, async (context: Koa.Context) => {
        const body = context.request?.body || {} as any;
        // const { prompt, messages } = ctx.request.body as { prompt: string, messages?: any[] };
        // generate chat message
        if (!body?.prompt) {
            return sendError(context, HTTP_CODES.BAD_REQUEST, API_ERROR_MESSAGES.EMPTY_PROMPT);
        }
        try {
            const response = await assistant.generateElements({
                prompt: body?.prompt,
                messages: body?.messages || [],
            });
            return sendData(context, response);
        }
        catch (response) {
            error(response?.error?.message || response);
            sendError(context, HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.ERROR_PERFORMING_REQUEST);
        }
    });

    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    // start app
    app.listen(port, () => {
        log(`Server running at 'http://127.0.0.1:${port}'`);
        log(`Use Control-C to stop this server.`);
    });

    return app;
};
