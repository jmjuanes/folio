import { UnauthorizedError } from "../errors.ts";
import { verifyJwtToken } from "../token.ts";

import type { Context } from "koa";
import type { Config } from "../config.ts";
import type { TokenPayload } from "../authentication.ts";

// authentication middleware
export const authentication = async (ctx: Context, next: () => Promise<any>) => {
    const config = ctx.state?.config as Config;
    const authHeader = ctx.headers?.authorization as string | undefined;
    const token = authHeader && authHeader.split(" ")[1];

    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        throw new UnauthorizedError();
    }

    // verify the token and extract user information
    // if the JWT is not valid, this method will return null
    const tokenPayload: TokenPayload | null = verifyJwtToken(token, {
        secret: config?.jwt_token_secret,
    });

    if (!tokenPayload?.username) {
        throw new UnauthorizedError("Token is not valid");
    }

    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.username = tokenPayload.username;

    await next();
};
