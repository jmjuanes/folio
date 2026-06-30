import ms from "ms";
import { createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "./errors.ts"
import type { StringValue } from "ms";

export type SessionOptions = {
    expiration?: StringValue | string;
    algorithm?: string;
};

// generate a signed session token for the given user
export const generateSession = async (username: string, secret: string, options?: SessionOptions): Promise<string> => {
    const expires = Date.now() + ms((options?.expiration || "7d") as StringValue);
    const payload = `${username}.${expires}`;
    const signature = createHmac(options?.algorithm || "sha256", secret).update(payload).digest("base64url");
    return Promise.resolve(`${payload}.${signature}`);
};

// validate a session token and return the username if valid
export const validateSession = async (session: string, secret: string, options?: SessionOptions): Promise<string> => {
    const parts = session.split(".");
    if (parts.length !== 3) {
        throw new UnauthorizedError("Invalid session format");
    }
    const [username, expires, signature] = parts;
    const payload = `${username}.${expires}`;
    const expectedSignature = createHmac(options?.algorithm || "sha256", secret).update(payload).digest("base64url");
    const validSignature = signature.length === expectedSignature.length &&
        timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    // not valid signature or session is expired
    if (!validSignature) {
        throw new UnauthorizedError("Invalid session signature");
    }
    if (Date.now() > Number(expires)) {
        throw new UnauthorizedError("Session expired");
    }
    return username;
};
