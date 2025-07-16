import { verifyJwtToken } from "../token";
import { ExtendedContext } from "../types/commons";

// authentication middleware
export const authentication = async (ctx: ExtendedContext, next: () => Promise<any>) => {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    // validate that token has been provided in the authorization header
    // if not, return 401 Unauthorized
    if (!token) {
        return ctx.send(401, {
            message: "Authentication required",
        });
    }
    // verify the token and extract user information
    const payload = verifyJwtToken(token) as { id: string } | null;
    if (!payload || !payload?.id) {
        return ctx.send(403, {
            message: "Invalid or expired token",
        });
    }
    // attach user information to the context state for use in subsequent middleware or routes
    ctx.state.user_id = payload.id;
    await next();
};
