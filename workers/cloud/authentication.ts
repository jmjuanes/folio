import ms from "ms";
import { createHmac, timingSafeEqual } from "node:crypto";
import { InternalServerError, UnauthorizedError, ValidationError } from "./errors.ts";
import type { StringValue } from "ms";
import type { Env } from "./types.ts";

const DEFAULT_USER = "folio";

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

// generate a signed session token for the given user
export const generateSession = async (env: Env, username: string): Promise<string> => {
    const expires = Date.now() + ms(env.SESSION_EXPIRATION as StringValue);
    const payload = `${username}.${expires}`;
    const signature = createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
    return Promise.resolve(`${payload}.${signature}`);
};

// validate a session token and return the username if valid
export const validateSession = async (env: Env, session: string): Promise<string> => {
    const parts = session.split(".");
    if (parts.length !== 3) {
        throw new UnauthorizedError("Invalid session format");
    }
    const [username, expires, signature] = parts;
    const payload = `${username}.${expires}`;
    const expectedSignature = createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");

    const validSignature = signature.length === expectedSignature.length &&
        timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!validSignature) {
        throw new UnauthorizedError("Invalid session signature");
    }
    if (Date.now() > Number(expires)) {
        throw new UnauthorizedError("Session expired");
    }
    return username;
};
