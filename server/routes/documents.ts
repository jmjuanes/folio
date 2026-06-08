import Router from "@koa/router";
import { authentication } from "../middlewares/authentication.ts";

import type { Context } from "koa";
import { sendDataResponse } from "../utils/response.ts";

export const documentsRouter = new Router();

documentsRouter.use(authentication);

// get / --> return all documents
documentsRouter.get("/", async (ctx: Context) => {
    sendDataResponse(ctx, await ctx.state.storage.getDocuments());
});

// post / --> create a new document
documentsRouter.post("/", async (ctx: Context) => {
    const { attributes, data } = ctx.request.body as any;
    const result = await ctx.state.storage.createDocument(attributes || {}, data || {});
    sendDataResponse(ctx, {
        id: result.id,
    })
});

// get /{id} --> get the information of a single document
documentsRouter.get("/:id", async (ctx: Context) => {
    const result = await ctx.state.storage.getDocument(ctx.params.id);
    sendDataResponse(ctx, result);
});

// delete /{id} --> delete the document
documentsRouter.delete("/:id", async (ctx: Context) => {
    await ctx.state.storage.deleteDocument(ctx.params.id);
    sendDataResponse(ctx, { message: "ok" });
});

// get /{id}/data --> get only documment data
documentsRouter.get("/:id/data", async (ctx: Context) => {
    const result = await ctx.state.storage.getDocumentData(ctx.params.id);
    sendDataResponse(ctx, result);
});

// patch /{id}/data --> update document data
documentsRouter.patch("/:id/data", async (ctx: Context) => {
    await ctx.state.storage.updateDocumentData(ctx.params.id, ctx.request.body || {});
    sendDataResponse(ctx, { message: "ok" });
});

// get /{id}/attributes --> get document attributes
documentsRouter.get("/:id/attributes", async (ctx: Context) => {
    const result = await ctx.state.storage.getDocumentAttributes(ctx.params.id);
    sendDataResponse(ctx, result);
});

// patch /{id}/attributes --> update document attributes
documentsRouter.patch("/:id/attributes", async (ctx: Context) => {
    await ctx.state.storage.updateDocumentAttributes(ctx.params.id, ctx.request.body || {});
    sendDataResponse(ctx, { message: "ok" });
});
