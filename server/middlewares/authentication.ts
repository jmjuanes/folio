import { verifyJwtToken } from "../token.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { SecurityConfig } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { User } from "../types/user.ts";

// authentication middleware
export const authentication = async (ctx: ExtendedContext, next: () => Promise<any>) => {
    const securityConfig = ctx.state?.config?.security as SecurityConfig;
    const authHeader = ctx.headers?.authorization as string | undefined;
    const token = authHeader && authHeader.split(" ")[1];

    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        return ctx.send(HTTP_CODES.UNAUTHORIZED, {
            message: API_ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
        });
    }

    // verify the token and extract user information
    // if the JWT is not valid, this method will return null
    const payload: User | null = verifyJwtToken(token, {
        secret: securityConfig?.jwt_token_secret,
    });

    if (!payload) {
        return ctx.send(HTTP_CODES.FORBIDDEN, {
            message: API_ERROR_MESSAGES.INVALID_TOKEN,
        });
    }

    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.user = payload;

    await next();
};
