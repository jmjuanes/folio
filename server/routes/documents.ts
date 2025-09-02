import { v4 as uuidv4 } from "uuid";
import Router from "@koa/router";
import { createLogger } from "../utils/logger.ts";
import { authentication } from "../middlewares/authentication.ts";
import { API_ERROR_MESSAGES, HTTP_CODES } from "../constants.ts";
import type { ExtendedContext } from "../types/custom.ts";
import type { DocumentFilter } from "../types/document.ts";

const log = createLogger("folio:route:documents");
export const documentsRouter = new Router();

// accessing documents routes requires authentication
documentsRouter.use(authentication);

// GET / --> return the list of documents of the authenticated user
documentsRouter.get("/", async (ctx: ExtendedContext) => {
    const filters = ctx.request.query || {} as DocumentFilter;
    const username = ctx.state.username as string;
    try {
        const results = await ctx.state.store.queryDocuments(username, {
            collection: filters.collection || null,
        });
        return ctx.ok({
            data: results,
        });
    } catch (error) {
        log.error(`error getting documents: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// POST / --> add a new document
documentsRouter.post("/", async (ctx: ExtendedContext) => {
    const username = ctx.state.username as string;
    const { collection, name, thumbnail, data } = ctx.request.body;
    try {
        const newDocumentId = uuidv4(); // generate a unique ID for the object
        await ctx.state.store.addDocument(username, newDocumentId, { collection, name, thumbnail, data });
        return ctx.ok({
            data: {
                id: newDocumentId,
            },
        });
    } catch (error) {
        log.error(`error adding a new document: ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// GET /:id --> get the document with the given id
documentsRouter.get("/:id", async (ctx: ExtendedContext) => {
    const { id } = ctx.params;
    const username = ctx.state.username as string;
    try {
        const result = await ctx.state.store.getDocument(username, id);
        return ctx.ok({
            data: result,
        });
    } catch (error) {
        log.error(`error getting document '${id}': ${error.message}`);
        ctx.error(HTTP_CODES.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
});

// PATCH /:id --> update the document
documentsRouter.patch("/:id", async (ctx: ExtendedContext) => {
    const username = ctx.state.username as string;
    const { id } = ctx.params;
    const { name, thumbnail, data } = ctx.request.body;
    try {
        await ctx.state.store.updateDocument(username, id, { name, thumbnail, data });
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

// DELETE /:id --> delete the document
documentsRouter.delete("/:id", async (ctx: ExtendedContext) => {
    const username = ctx.state.username as string;
    const { id } = ctx.params;
    try {
        await ctx.state.store.deleteDocument(username, id);
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
