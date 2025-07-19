import { verifyJwtToken } from "../token.ts";
import type { SecurityConfig } from "../config.ts";
import type { AuthPayload } from "../types/authentication.ts";
import type { ExtendedContext } from "../types/custom.ts";

// authentication middleware
export const authentication = async (ctx: ExtendedContext, next: () => Promise<any>) => {
    const securityConfig = ctx.state?.config?.security as SecurityConfig;
    const authHeader = ctx.headers?.authorization as string | undefined;
    const token = authHeader && authHeader.split(" ")[1];

    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        return ctx.send(401, {
            message: "Authentication required",
        });
    }

    // verify the token and extract user information
    // if the JWT is not valid, this method will return null
    const payload: AuthPayload | null = verifyJwtToken(token, {
        secret: securityConfig?.jwt_token_secret,
    });

    if (!payload) {
        return ctx.send(403, {
            message: "Invalid or expired token",
        });
    }

    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.user = payload;

    await next();
};
