import ms from "ms";
import { createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "./errors.ts"
import type { StringValue } from "ms";

export type SessionOptions = {
    prefix?: string;
    expiration?: StringValue | string;
    algorithm?: string;
};

// generate a signed session token for the given user
export const generateSession = async (username: string, secret: string, options?: SessionOptions): Promise<string> => {
    const prefix = options?.prefix || "folio_";
    const expires = Date.now() + ms((options?.expiration || "7d") as StringValue);
    const payload = Buffer.from(`${username}.${expires}`, "utf8").toString("base64url");
    const signature = createHmac(options?.algorithm || "sha256", secret).update(payload).digest("base64url");
    return Promise.resolve(`${prefix}${payload}.${signature}`);
};

// validate a session token and return the username if valid
export const validateSession = async (session: string, secret: string, options?: SessionOptions): Promise<string> => {
    // 1. validate the session token starts with the configured prefix
    const prefix = options?.prefix || "folio_";
    if (!session.startsWith(prefix)) {
        throw new UnauthorizedError("Invalid session token");
    }
    // 2. validate the session token has the correct format
    const [payload, signature] = session.replace(prefix, "").split(".");
    if (!payload || !signature) {
        throw new UnauthorizedError("Invalid session token");
    }
    // 3. validate the session has a valid signature
    const expectedSignature = createHmac(options?.algorithm || "sha256", secret).update(payload).digest("base64url");
    const validSignature = signature.length === expectedSignature.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!validSignature) {
        throw new UnauthorizedError("Invalid session token");
    }
    // 4. extract the username and expiration from the payload
    const decodedPayload = Buffer.from(payload, "base64url").toString("utf8");
    const [username, expires] = decodedPayload.split(".");
    if (Date.now() > Number(expires)) {
        throw new UnauthorizedError("Session expired");
    }
    return username;
};
