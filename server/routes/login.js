import Router from "@koa/router";
import { db } from "../database.js";
import { ACCESS_TOKEN, generateJwtToken } from "../token.js";
import { DB_TABLE, OBJECT_TYPES } from "../config.js";

export const loginRouter = new Router();

// GET - login route
loginRouter.get("/", async ctx => {
    return ctx.send(405, {
        message: "Method Not Allowed. Use POST to login.",
    });
});

// POST - login route
loginRouter.post("/", async ctx => {
    const {token} = ctx.request.body;
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
    const user = await db.get(
        `SELECT id FROM ${DB_TABLE} WHERE object = ?`,
        [OBJECT_TYPES.USER],
    );
    // generate the JWT token for API access and return it as part 
    // of the response object
    return ctx.ok({
        message: "ok",
        token: generateJwtToken({
            id: user.id,
        }),
    });
});
