import { Provider } from "./constants.ts";
import { createAssistant } from "./assistant.ts";
import { createProvider } from "./providers/index.ts";

const DEFAULT_PROVIDER = Provider.Groq;
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_MAX_REQUESTS_PER_DAY = 10;

// available endpoints
enum Endpoint {
    Status = "/_ai/status",
    Quotas = "/_ai/quotas",
    GenerateElements = "/_ai/generateElements",
    TransformElements = "/_ai/transformElements",
};

// error messages
enum APIErrorMessage {
    APIKeyNotConfigured = "FOLIO_AI_APIKEY not configured.",
    ErrorPerformingRequest = "Error performing the request. Contact the administrator.",
    EmptyPrompt = "Prompt is empty.",
    DailyRequestsLimitReached = "Daily requests limit reached. Please try again tomorrow.",
    NotFound = "Not found.",
};

export interface Env {
    FOLIO_AI_PROVIDER?: string;
    FOLIO_AI_APIKEY?: string;
    FOLIO_AI_BASE_URL?: string;
    FOLIO_AI_MODEL?: string;
    FOLIO_AI_MAX_REQUESTS_PER_DAY?: string;
    FOLIO_AI_ALLOWED_ORIGINS?: string;
    QUOTAS_KV: KVNamespace;
};

// get today's date as YYYY-MM-DD for KV key
const getTodayKey = (requestIp: string): string => {
    const today = (new Date()).toISOString().slice(0, 10); // "2026-02-20"
    return `quota:${today}:${requestIp}`;
};

// get the configured requests limit
const getRequestsLimit = (env: Env): number => {
    if (env.FOLIO_AI_MAX_REQUESTS_PER_DAY) {
        const parsed = parseInt(env.FOLIO_AI_MAX_REQUESTS_PER_DAY, 10);
        return isNaN(parsed) ? DEFAULT_MAX_REQUESTS_PER_DAY : parsed;
    }
    return DEFAULT_MAX_REQUESTS_PER_DAY;
};

// get the number of requests used today from KV
const getRequestsUsed = async (env: Env, requestIp: string): Promise<number> => {
    const key = getTodayKey(requestIp);
    const value = await env.QUOTAS_KV.get(key);
    return value ? parseInt(value, 10) : 0;
};

// increment the requests counter in KV
const incrementRequestsUsed = async (env: Env, requestIp: string): Promise<void> => {
    const key = getTodayKey(requestIp);
    const current = await getRequestsUsed(env, requestIp);
    // store with 24h TTL so keys auto-expire
    await env.QUOTAS_KV.put(key, String(current + 1), {
        expiration: Math.floor(new Date().setUTCHours(24, 0, 0, 0) / 1000),
    });
};

// helper to send a JSON response
const sendResponse = (env: Env, request: Request, statusCode: number, body: any, extraHeaders: Record<string, string> = {}): Response => {
    const origin = request.headers.get("Origin");
    const allowedOrigins = env.FOLIO_AI_ALLOWED_ORIGINS || "*";
    const responseOrigin = (allowedOrigins === "*" || allowedOrigins === origin) ? (origin || allowedOrigins) : allowedOrigins;
    const responseHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": responseOrigin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // include content-type header if body is sent in the response
    if (body) {
        responseHeaders["Content-Type"] = "application/json";
    }

    // merge response headers with extra headers and send the response
    return new Response(body ? JSON.stringify(body) : null, {
        status: statusCode,
        headers: Object.assign({}, responseHeaders, extraHeaders || {}),
    });
};

const sendDataResponse = (env: Env, request: Request, data: any): Response => {
    return sendResponse(env, request, 200, { data });
};

const sendErrorResponse = (env: Env, request: Request, statusCode: number, message: string): Response => {
    return sendResponse(env, request, statusCode, {
        errors: [{ message }],
    });
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";

        // handle CORS preflight
        if (request.method === "OPTIONS") {
            return sendResponse(env, request, 204, null);
        }

        // --- GET /status ---
        if (url.pathname === Endpoint.Status && request.method === "GET") {
            return sendDataResponse(env, request, { message: "ok" });
        }

        // --- POST /quotas ---
        if (url.pathname === Endpoint.Quotas && request.method === "POST") {
            try {
                const requestsUsed = await getRequestsUsed(env, ip);
                return sendDataResponse(env, request, {
                    requestsLimit: getRequestsLimit(env),
                    requestsUsed: requestsUsed,
                });
            } catch (error: any) {
                console.error("Error reading quotas:", error.message);
                return sendErrorResponse(env, request, 500, error.message || APIErrorMessage.ErrorPerformingRequest);
            }
        }

        // --- POST /generateElements ---
        if (url.pathname === Endpoint.GenerateElements && request.method === "POST") {
            // validate API key
            if (!env.FOLIO_AI_APIKEY) {
                return sendErrorResponse(env, request, 500, APIErrorMessage.APIKeyNotConfigured);
            }

            try {
                const body: any = await request.json();
                // validate prompt to prevent empty requests
                if (!body?.prompt) {
                    return sendErrorResponse(env, request, 400, APIErrorMessage.EmptyPrompt);
                }

                const requestsLimit = getRequestsLimit(env);
                const requestsUsed = await getRequestsUsed(env, ip);
                if (requestsUsed >= requestsLimit) {
                    return sendErrorResponse(env, request, 429, APIErrorMessage.DailyRequestsLimitReached);
                }
                // increment requests counter before performing the request
                await incrementRequestsUsed(env, ip);
                // create assistant and generate elements
                const providerInstance = createProvider({
                    provider: (env.FOLIO_AI_PROVIDER ?? DEFAULT_PROVIDER) as Provider,
                    apiKey: env.FOLIO_AI_APIKEY || "",
                    model: env.FOLIO_AI_MODEL || DEFAULT_MODEL,
                    baseUrl: env.FOLIO_AI_BASE_URL || "",
                });
                const assistant = createAssistant(providerInstance);
                const result = await assistant.generateElements({
                    prompt: body.prompt,
                });

                return sendDataResponse(env, request, result);
            } catch (error: any) {
                console.error(error?.error?.message || error);
                return sendErrorResponse(env, request, 500, error?.error?.message || APIErrorMessage.ErrorPerformingRequest);
            }
        }

        // --- Not found ---
        return sendErrorResponse(env, request, 404, APIErrorMessage.NotFound);
    },
};
