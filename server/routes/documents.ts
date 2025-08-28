import Router from "@koa/router";
import { uid } from "uid/secure";
import { createLogger } from "../utils/logger.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";

const log = createLogger("folio:route:documents");
export const documentsRouter = new Router();

// GET /
documentsRouter.get("/", async (ctx: ExtendedContext) => {
    ctx.error(HTTP_CODES.METHOD_NOT_ALLOWED, API_ERROR_MESSAGES.METHOD_NOT_ALLOWED);
});

// GET /:collection --> return list of documents of the given collection
documentsRouter.get("/:collection", async (ctx: ExtendedContext) => {
    const collection = ctx.params.collection;
    try {
        const results = await ctx.state.store.list(collection);
        return ctx.ok({
            data: results,
        });
    } catch (error) {
        log.error(`error getting documents of the collection '${collection}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// POST /:collection --> add a new document to this collection
documentsRouter.post("/:collection", async (ctx: ExtendedContext) => {
    const collection = ctx.params.collection;
    const { attributes, data } = ctx.request.body;
    try {
        const newDocumentId = uid(20); // generate a unique ID for the object
        await ctx.state.store.add(collection, newDocumentId, attributes, data);
        return ctx.ok({
            data: {
                id: newDocumentId,
                attributes: attributes,
            },
        });
    } catch (error) {
        log.error(`error adding a new document in collection '${collection}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// GET /:collection/:id --> get the document
documentsRouter.get("/:collection/:id", async (ctx: ExtendedContext) => {
    const { collection, id } = ctx.params;
    try {
        const result = await ctx.state.store.get(collection, id);
        return ctx.ok({
            data: result,
        });
    } catch (error) {
        log.error(`error getting document '${id}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// PATCH /:collection/:id --> update the data/attributes of the document
documentsRouter.patch("/:collection/:id", async (ctx: ExtendedContext) => {
    const { collection, id } = ctx.params;
    const { data, attributes } = ctx.request.body;
    try {
        await ctx.state.store.update(collection, id, attributes, data);
        return ctx.ok({
            data: {
                id: id,
            },
        })
    } catch (error) {
        log.error(`error updating document '${id}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// DELETE /:collection/:id --> delete the document
documentsRouter.delete("/:collection/:id", async (ctx: ExtendedContext) => {
    const { collection, id } = ctx.params;
    try {
        await ctx.state.store.delete(collection, id);
        return ctx.ok({
            data: {
                id: id,
            },
        })
    } catch (error) {
        log.error(`error deleting document '${id}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});
