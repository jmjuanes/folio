import { authenticationMiddleware } from "folio-shared";
import { sendResponse, sendDataResponse, sendErrorResponse } from "folio-shared";
import { MethodNotAllowedError, NotFoundError, ValidationError } from "folio-shared";
import type { Env } from "./types.ts";

// available endpoints
enum Endpoints {
    ROOT = "/",
    STATUS = "/status",
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        // const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        // 1. handle CORS preflight
        if (request.method === "OPTIONS") {
            return sendResponse(env, request, 204, null);
        }
        // 2. handle routes
        try {
            if (url.pathname === Endpoints.STATUS) {
                if (request.method === "GET") {
                    return sendDataResponse(env, request, { message: "ok" });
                }
                // method not allowed
                throw new MethodNotAllowedError();
            }
            // other routes require authentication
            const username: string = await authenticationMiddleware(request, env.SESSION_SECRET);
            // -- GET/POST / --
            if (url.pathname === Endpoints.ROOT) {
                if (request.method === "GET") {
                    const prefix = url.searchParams.get("prefix") || "";
                    const list = await env.STORAGE.list({
                        prefix: `${username}/${prefix}`,
                    });
                    // note: we have to remove the 'username/' prefix of the returned items
                    // as the user is only used internally
                    return sendDataResponse(env, request, (list?.keys || []).map((item: any) => {
                        return Object.assign(item, {
                            id: item.name.replace(username + "/", ""),
                        });
                    }));
                }
                else if (request.method === "POST") {
                    const body: any = await request.json();
                    // valudate that at least an 'id' and 'value' fields exists in body
                    if (!body.id || !body.value) {
                        throw new ValidationError("fields 'id' and 'value' are required to register in the storage");
                    }
                    // const storageId: string = randomUUID();
                    await env.STORAGE.put(`${username}/${body.id}`, body?.value || {}, {
                        metadata: body?.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        id: body.id,
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // -- GET/PATCH/DELETE Storage with ID --
            else if (url.pathname.startsWith(Endpoints.ROOT)) {
                // extract the document from the path
                const match = url.pathname.match(/^\/([^/]+)\/?$/);
                if (!match) {
                    throw new NotFoundError();
                }
                const id = match[1];
                // GET document content and metadata
                if (request.method === "GET") {
                    const entry = await env.STORAGE.getWithMetadata(`${username}/${id}`, "json");
                    if (entry.value) {
                        return sendDataResponse(env, request, {
                            value: entry.value,
                            metadata: entry.metadata,
                        });
                    }
                    // if document.value is null, this document does not exist
                    throw new NotFoundError();
                }
                else if (request.method === "PATCH") {
                    const body: any = await request.json();
                    await env.STORAGE.put(`${username}/${id}`, body.value || {}, {
                        metadata: body.metadata || {},
                    });
                    return sendDataResponse(env, request, {
                        message: "updated",
                    });
                }
                else if (request.method === "DELETE") {
                    await env.STORAGE.delete(`${username}/${id}`);
                    return sendDataResponse(env, request, {
                        message: "deleted",
                    });
                }
                // other case --> method not allowed
                throw new MethodNotAllowedError();
            }
            // --- Not found ---
            throw new NotFoundError();
        }
        catch (error: any) {
            // check for application error
            if (typeof error?.statusCode === "number") {
                return sendErrorResponse(env, request, error.statusCode, error.message);
            }
            // general internal server error
            return sendErrorResponse(env, request, 500, error?.message || "Internal Server Error");
        }
    },
};
