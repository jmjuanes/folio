import Router from "@koa/router";
import { graphql } from "graphql";
import { authentication } from "../middlewares/authentication.ts";
import { schema } from "../graphql.ts";
import { createLogger } from "../utils/logger.ts";
import type { ExtendedContext } from "../types/custom.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";

export const graphqlRouter = new Router();

const log = createLogger("folio:route:graphql");

graphqlRouter.use(authentication);

// GET - graphql route
graphqlRouter.get("/", async (ctx: ExtendedContext) => {
    ctx.error(HTTP_CODES.METHOD_NOT_ALLOWED, API_ERROR_MESSAGES.METHOD_NOT_ALLOWED);
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
                username: ctx.state.username,
                store: ctx.state.store,
                auth: ctx.state.auth,
            },
        });
        // send the response back to the client
        return ctx.ok(response);
    }
    catch (error) {
        log.error(`error executing graphql query: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});
