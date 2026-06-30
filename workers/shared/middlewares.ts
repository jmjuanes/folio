import { validateSession } from "./session.ts";
import { UnauthorizedError } from "./errors.ts";

// middleware to validate the session and return the username that is performing the request
export const authenticationMiddleware = async (request: Request, secret: string ): Promise<string> => {
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
    return validateSession(token, secret);
};

