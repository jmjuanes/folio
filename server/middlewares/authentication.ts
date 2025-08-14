import { verifyJwtToken } from "../token.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { Config } from "../config.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { User } from "../types/user.ts";

// authentication middleware
export const authentication = async (ctx: ExtendedContext, next: () => Promise<any>) => {
    const config = ctx.state?.config as Config;
    const authHeader = ctx.headers?.authorization as string | undefined;
    const token = authHeader && authHeader.split(" ")[1];

    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        return ctx.error(HTTP_CODES.UNAUTHORIZED, API_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    // verify the token and extract user information
    // if the JWT is not valid, this method will return null
    const payload: Partial<User>|null = verifyJwtToken(token, {
        secret: config?.jwt_token_secret,
    });

    if (!payload || !payload?.username) {
        return ctx.error(HTTP_CODES.FORBIDDEN, API_ERROR_MESSAGES.INVALID_TOKEN);
    }

    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.username = payload.username;

    await next();
};
