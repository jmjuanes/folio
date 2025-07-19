import Router from "@koa/router";
import { graphql } from "graphql";
import { authentication } from "../middlewares/authentication.ts";
import { schema } from "../graphql.ts";
import type { ExtendedContext } from "../types/custom.d.ts";

export const graphqlRouter = new Router();

graphqlRouter.use(authentication);

// GET - graphql route
graphqlRouter.get("/", async (ctx: ExtendedContext) => {
    return ctx.send(405, {
        message: "Method Not Allowed. Use POST to query GraphQL.",
    });
});

// POST - graphql route
graphqlRouter.post("/", async (ctx: ExtendedContext) => {
    const { query, variables } = ctx.request.body;
    try {
        const response = await graphql({
            schema: schema,
            source: query || "",
            variableValues: variables,
            contextValue: {
                user: ctx.state.user,
                store: ctx.state.store,
                auth: ctx.state.auth,
            },
        });
        // send the response back to the client
        return ctx.ok(response);
    }
    catch (error) {
        console.error("Error executing GraphQL query:", error);
        return ctx.send(500, {
            message: "Internal Server Error",
        });
    }
});
