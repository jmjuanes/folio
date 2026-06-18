import ms from "ms";
import { parseCookie } from "cookie";
import { sendResponse, sendDataResponse, sendErrorResponse } from "./response.ts";
import { MethodNotAllowedError, NotFoundError, UnauthorizedError, ValidationError } from "./errors.ts";
import { authenticateUser, generateSession, validateSession } from "./authentication.ts";
import type { StringValue } from "ms";
import type { Env } from "./types.ts";

// available endpoints
enum Endpoints {
    ROOT = "/",
    STATUS = "/status",
    AUTH_LOGIN = "/auth/login",
    AUTH_LOGOUT = "/auth/logout",
    STORAGE = "/storage",
};

// middleware to validate the session and return the username that is performing the request
const authenticationMiddleware = async (env: Env, request: Request): Promise<string> => {
    const cookies = parseCookie(request.headers.get("Cookie") ?? "");
    if (!cookies?.session) {
        throw new UnauthorizedError();
    }
    return validateSession(env, cookies.session);
};

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
                    "login_url": Endpoints.AUTH_LOGIN,
                    "logout_url": Endpoints.AUTH_LOGOUT,
                    "storage_url": Endpoints.STORAGE,
                });
            }
            // -- GET Status --
            else if (url.pathname === Endpoints.STATUS && request.method === "GET") {
                return sendDataResponse(env, request, { message: "ok" });
            }
            // -- POST Login --
            else if (url.pathname === Endpoints.AUTH_LOGIN) {
                if (request.method !== "POST") {
                    throw new MethodNotAllowedError();
                }
                // get login information from body and call authenticate method
                const body: any = await request.json();
                if (env.ACCESS_TOKEN && !body.token) {
                    throw new ValidationError("Token is required for login");
                }
                if (!env.ACCESS_TOKEN && (!body.username || !body.password)) {
                    throw new ValidationError("Username and password are required for login");
                }
                // authenticate user and create the session
                const username: string = await authenticateUser(env, body);
                const session: string = await generateSession(env, username);
                const sessionMaxAge = ms(env.SESSION_EXPIRATION as StringValue) / 1000;
                // create the cookie and send a message that the user has been authenticated
                return sendResponse(env, request, 200, {}, {
                    "Set-Cookie": `session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${sessionMaxAge}`,
                });
            }
            // -- POST logout --
            else if (url.pathname === Endpoints.AUTH_LOGOUT) {
                if (request.method === "POST") {
                    return sendResponse(env, request, 200, {}, {
                        "Set-Cookie": `session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
                    });
                }
                // not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/POST Storage --
            else if (url.pathname === Endpoints.STORAGE) {
                const username = await authenticationMiddleware(env, request);
                if (request.method === "GET") {
                    const prefix = url.searchParams.get("prefix") || "";
                    const list = await env.STORAGE.list({
                        prefix: `${username}/${prefix}`,
                    });
                    return sendDataResponse(env, request, list?.keys || []);
                }
                else if (request.method === "POST") {
                    const body: any = await request.json();
                    // valudate that at least an 'id' and 'value' fields exists in body
                    if (!body.id || !body.value) {
                        throw new ValidationError("and 'id' and 'value' is required to register in the storage");
                    }
                    // const storageId: string = randomUUID();
                    await env.STORAGE.put(`${username}/${body.id}`, body?.value || {}, {
                        metadata: body?.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        id: body.id,
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/PATCH/DELETE Storage with ID --
            else if (url.pathname.startsWith(Endpoints.STORAGE) && url.pathname !== Endpoints.STORAGE) {
                // extract the document from the path
                const match = url.pathname.match(/^\/storage\/([^/]+)\/?$/);
                if (!match) {
                    throw new NotFoundError();
                }
                const id = match[1];
                const username = await authenticationMiddleware(env, request);
                // GET document content and metadata
                if (request.method === "GET") {
                    const entry = await env.STORAGE.getWithMetadata(`${username}/${id}`, "json");
                    if (entry.value) {
                        return sendDataResponse(env, request, {
                            value: entry.value,
                            metadata: entry.metadata,
                        });
                    }
                    // if document.value is null, this document does not exist
                    throw new NotFoundError();
                }
                else if (request.method === "PATCH") {
                    const body: any = await request.json();
                    await env.STORAGE.put(`${username}/${id}`, body.value || {}, {
                        metadata: body.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        message: "updated",
                    });
                }
                else if (request.method === "DELETE") {
                    await env.STORAGE.delete(`${username}/${id}`);
                    return sendDataResponse(env, request, {
                        message: "deleted",
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // --- Not found ---
            throw new NotFoundError();
        }
        catch (error: any) {
            // check for application error
            if (typeof error?.statusCode === "number") {
                return sendErrorResponse(env, request, error.statusCode, error.message);
            }
            // general internal server error
            return sendErrorResponse(env, request, 500, error?.message || "Internal Server Error");
        }
    },
};
