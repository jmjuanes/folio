import { ENDPOINTS, API_ERROR_MESSAGES } from "./constants.ts";
import { createAssistant } from "./ai.ts";

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_REQUESTS_LIMIT = 10;

export interface Env {
    FOLIO_AI_APIKEY?: string;
    FOLIO_AI_BASE_URL?: string;
    FOLIO_AI_MODEL?: string;
    FOLIO_AI_MAX_REQUESTS?: string;
    FOLIO_AI_ALLOWED_ORIGIN?: string;
    QUOTAS_KV: KVNamespace;
}

// get today's date as YYYY-MM-DD for KV key
const getTodayKey = (requestIp: string): string => {
    const today = (new Date()).toISOString().slice(0, 10); // "2026-02-20"
    return `quota:${today}:${requestIp}`;
};

// get the configured requests limit
const getRequestsLimit = (env: Env): number => {
    if (env.FOLIO_AI_MAX_REQUESTS) {
        const parsed = parseInt(env.FOLIO_AI_MAX_REQUESTS, 10);
        return isNaN(parsed) ? DEFAULT_REQUESTS_LIMIT : parsed;
    }
    return DEFAULT_REQUESTS_LIMIT;
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
    const allowedOrigin = env.FOLIO_AI_ALLOWED_ORIGIN || "*";
    const responseOrigin = (allowedOrigin === "*" || allowedOrigin === origin) ? (origin || allowedOrigin) : allowedOrigin;

    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": responseOrigin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...extraHeaders,
        },
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
            const origin = request.headers.get("Origin");
            const allowedOrigin = env.FOLIO_AI_ALLOWED_ORIGIN || "*";
            const responseOrigin = (allowedOrigin === "*" || allowedOrigin === origin) ? (origin || allowedOrigin) : allowedOrigin;

            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": responseOrigin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // --- GET /_status ---
        if (url.pathname === ENDPOINTS.STATUS && request.method === "GET") {
            return sendDataResponse(env, request, { message: "ok" });
        }

        // --- POST /_quotas ---
        if (url.pathname === ENDPOINTS.QUOTAS && request.method === "POST") {
            try {
                const requestsUsed = await getRequestsUsed(env, ip);
                return sendDataResponse(env, request, {
                    requestsLimit: getRequestsLimit(env),
                    requestsUsed: requestsUsed,
                });
            } catch (error: any) {
                console.error("Error reading quotas:", error.message);
                return sendErrorResponse(env, request, 500, error.message || API_ERROR_MESSAGES.ERROR_PERFORMING_REQUEST);
            }
        }

        // --- POST /_generateElements ---
        if (url.pathname === ENDPOINTS.GENERATE_ELEMENTS && request.method === "POST") {
            // validate API key
            if (!env.FOLIO_AI_APIKEY) {
                return sendErrorResponse(env, request, 500, "FOLIO_AI_APIKEY is not configured");
            }

            try {
                const body: any = await request.json();
                // validate prompt to prevent empty requests
                if (!body?.prompt) {
                    return sendErrorResponse(env, request, 400, API_ERROR_MESSAGES.EMPTY_PROMPT);
                }

                const requestsLimit = getRequestsLimit(env);
                const requestsUsed = await getRequestsUsed(env, ip);
                if (requestsUsed >= requestsLimit) {
                    return sendErrorResponse(env, request, 429, API_ERROR_MESSAGES.DAILY_REQUESTS_LIMIT_REACHED);
                }
                // increment requests counter before performing the request
                await incrementRequestsUsed(env, ip);
                // create assistant and generate elements
                const assistant = createAssistant({
                    baseUrl: env.FOLIO_AI_BASE_URL,
                    apiKey: env.FOLIO_AI_APIKEY,
                    model: env.FOLIO_AI_MODEL || DEFAULT_MODEL,
                });

                const result = await assistant.generateElements({
                    prompt: body.prompt,
                });

                return sendDataResponse(env, request, result);
            } catch (error: any) {
                console.error(error?.error?.message || error);
                return sendErrorResponse(env, request, 500, error?.error?.message || API_ERROR_MESSAGES.ERROR_PERFORMING_REQUEST);
            }
        }

        // --- Not found ---
        return sendErrorResponse(env, request, 404, API_ERROR_MESSAGES.NOT_FOUND);
    },
};
