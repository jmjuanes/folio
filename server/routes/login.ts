import Router from "@koa/router";
import { ACCESS_TOKEN, generateJwtToken } from "../token";
import { OBJECT_TYPES } from "../env";
import { ExtendedContext } from "../types/commons";

export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async (ctx: ExtendedContext) => {
    return ctx.send(405, {
        message: "Method Not Allowed. Use POST to login.",
    });
});

// POST - login route
loginRouter.post("/", async (ctx: ExtendedContext) => {
    const { token } = ctx.request.body;
    if (!token) {
        return ctx.send(400, {
            message: "Token is required",
        });
    }
    // compare with the access token generated at server start
    if (token !== ACCESS_TOKEN) {
        return ctx.send(401, {
            message: "Invalid token",
        });
    }
    // get the user object from the database
    const users = await ctx.state.db.getChildrenObjects(OBJECT_TYPES.USER, null, false);
    if (users.length === 0 || users.length > 1) {
        return ctx.send(500, {
            message: "wtf??",
        });
    }
    // generate the JWT token for API access and return it as part 
    // of the response object
    return ctx.ok({
        message: "ok",
        token: generateJwtToken({
            id: users[0].id,
        }),
    });
});
