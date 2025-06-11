import {verifyJwtToken} from "../utils/token.js";

// Authentication middleware
export const authenticateToken = async (ctx, next) => {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        return ctx.sendError(ctx, 401, "Authentication required");
    }
    // verify the token and extract user information
    const user = verifyJwtToken(token);
    if (!user) {
        return ctx.sendError(ctx, 403, "Invalid or expired token");
    }
    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.user = user;
    await next();
};
