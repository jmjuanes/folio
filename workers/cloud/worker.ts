import { randomUUID } from "node:crypto";
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
    AUTHENTICATED_USER = "/user",
    AUTHENTICATED_USER_PREFERENCES = "/user/preferences",
    AUTHENTICATED_USER_DOCUMENTS = "/user/documents",
    DOCUMENTS = "/documents",
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
                    "current_user_url": Endpoints.AUTHENTICATED_USER,
                    "current_user_preferences_url": Endpoints.AUTHENTICATED_USER_PREFERENCES,
                    "current_user_documents_url": Endpoints.AUTHENTICATED_USER_DOCUMENTS,
                    "documents_url": Endpoints.DOCUMENTS,
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
            // -- GET/PATCH Authenticated user --
            else if (url.pathname === Endpoints.AUTHENTICATED_USER) {
                const username = await authenticationMiddleware(env, request);
                if (request.method === "GET") {
                    // get information about the authenticated user in the storage
                    const userInfo = await env.STORAGE.getWithMetadata(`users/${username}`, "json");
                    return sendDataResponse(env, request, userInfo?.value || {});
                }
                else if (request.method === "PATCH") {
                    const body: any = await request.json();
                    await env.STORAGE.put(`users/${username}`, body || {}, {
                        metadata: {
                            "updated_at": Date.now(),
                        },
                    });
                    return sendDataResponse(env, request, {
                        message: "user info updated",
                    });
                }
                // other case, method not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/PATCH Authenticated user preferences --
            else if (url.pathname === Endpoints.AUTHENTICATED_USER_PREFERENCES) {
                const username = await authenticationMiddleware(env, request);
                if (request.method === "GET") {
                    const userPreferences = await env.STORAGE.getWithMetadata(`preferences/${username}`, "json");
                    return sendDataResponse(env, request, userPreferences?.value || {});
                }
                else if (request.method === "PATCH") {
                    const body: any = await request.json();
                    await env.STORAGE.put(`preferences/${username}`, body || {}, {
                        metadata: {
                            "updated_at": Date.now(),
                        },
                    });
                    return sendDataResponse(env, request, {
                        message: "user preferences updated",
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/POST Authenticated user documents --
            else if (url.pathname === Endpoints.AUTHENTICATED_USER_DOCUMENTS) {
                const username = await authenticationMiddleware(env, request);
                if (request.method === "GET") {
                    const userDocuments = await env.STORAGE.list({
                        prefix: `documents/${username}/`,
                    });
                    return sendDataResponse(env, request, userDocuments?.keys || []);
                }
                else if (request.method === "POST") {
                    const body: any = await request.json();
                    const documentId: string = randomUUID();
                    await env.STORAGE.put(`documents/${username}/${documentId}`, body?.value || {}, {
                        metadata: body?.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        id: documentId,
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/PATCH/DELETE Documents --
            else if (url.pathname.startsWith(Endpoints.DOCUMENTS)) {
                // extract the document from the path
                const match = url.pathname.match(/^\/documents\/([^/]+)\/?$/);
                if (!match) {
                    throw new NotFoundError();
                }
                const documentId = match[1];
                const username = await authenticationMiddleware(env, request);
                // GET document content and metadata
                if (request.method === "GET") {
                    const document = await env.STORAGE.getWithMetadata(`documents/${username}/${documentId}`, "json");
                    if (document.value) {
                        return sendDataResponse(env, request, {
                            value: document.value,
                            metadata: document.metadata,
                        });
                    }
                    // if document.value is null, this document does not exist
                    throw new NotFoundError();
                }
                else if (request.method === "PATCH") {
                    const body: any = await request.json();
                    await env.STORAGE.put(`documents/${username}/${documentId}`, body.value || {}, {
                        metadata: body.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        message: "document updated",
                    });
                }
                else if (request.method === "DELETE") {
                    await env.STORAGE.delete(`documents/${username}/${documentId}`);
                    return sendDataResponse(env, request, {
                        message: "document deleted",
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
