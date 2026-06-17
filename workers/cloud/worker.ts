import { sendResponse, sendDataResponse, sendErrorResponse } from "./response.ts";
import { createLogger } from "./logger.ts";
import { NotFoundError } from "./errors.ts";
import type { Env } from "./types.ts";

// available endpoints
enum Endpoints {
    ROOT = "/",
    STATUS = "/status"
};

// global logger
const log = createLogger("folio:worker");

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        // const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        // 1. handle CORS preflight
        if (request.method === "OPTIONS") {
            return sendResponse(env, request, 204, null);
        }
        // 2. handle routes
        try {
            // --- GET Root ---
            if (url.pathname === Endpoints.ROOT && request.method === "GET") {
                return sendDataResponse(env, request, {
                    "status_url": Endpoints.STATUS,
                });
            }
            // -- GET Status --
            else if (url.pathname === Endpoints.STATUS && request.method === "GET") {
                return sendDataResponse(env, request, { message: "ok" });
            }
            // --- Not found ---
            throw new NotFoundError();
        }
        catch (error: any) {
            log.error(error.message || "");
            // check for application error
            if (typeof error?.statusCode === "number") {
                return sendErrorResponse(env, request, error.statusCode, error.message);
            }
            // general internal server error
            return sendErrorResponse(env, request, 500, error?.message || "Internal Server Error");
        }
    },
};
