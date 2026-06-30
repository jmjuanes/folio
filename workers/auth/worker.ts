import { generateSession, validateSession } from "folio-shared";
import { sendResponse, sendDataResponse, sendErrorResponse } from "folio-shared";
import { InternalServerError, MethodNotAllowedError, NotFoundError, UnauthorizedError, ValidationError } from "folio-shared";
import type { Env } from "./types.ts";

// default user when the authentication is access_token
const DEFAULT_USER = "folio";

// available endpoints
enum Endpoints {
    ROOT = "/",
    STATUS = "/status",
    LOGIN = "/login",
    ME = "/me"
};

// authenticate the user with the provided credentials
export const authenticateUser = async (env: Env, credentials: any): Promise<string> => {
    if (env.ACCESS_TOKEN) {
        if (!credentials.token) {
            throw new ValidationError("No token provided for login");
        }
        if (env.ACCESS_TOKEN !== credentials.token) {
            throw new UnauthorizedError("The provided token is not valid");
        }
        return Promise.resolve(DEFAULT_USER);
    }
    throw new InternalServerError("Authentication via username/password not implemented yet...");
};

// middleware to validate the session and return the username that is performing the request
const authenticationMiddleware = async (env: Env, request: Request): Promise<string> => {
    // 1. check if the authorization header is present
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
        throw new UnauthorizedError();
    }
    // 2. check for the Bearer prefix and split the string
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedError("Invalid Authorization.");
    }
    return validateSession(token, env.SESSION_SECRET);
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
                    "login_url": Endpoints.LOGIN,
                });
            }
            // -- GET Status --
            else if (url.pathname === Endpoints.STATUS && request.method === "GET") {
                return sendDataResponse(env, request, { message: "ok" });
            }
            // -- POST Login --
            else if (url.pathname === Endpoints.LOGIN) {
                if (request.method === "POST") {
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
                    const token: string = await generateSession(username, env.SESSION_SECRET, {
                        expiration: env.SESSION_EXPIRATION,
                    });
                    // create the cookie and send a message that the user has been authenticated
                    return sendResponse(env, request, 200, {
                        token: token,
                    });
                }
                throw new MethodNotAllowedError();
            }
            // -- GET Authenticated user --
            else if (url.pathname === Endpoints.ME) {
                const username = await authenticationMiddleware(env, request);
                if (request.method === "GET") {
                    return sendDataResponse(env, request, {
                        username: username,
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
