import { generateElements } from "./handler.js";
import schema from "../schema/element.schema.json" with { type: "json" };

export interface Env {
    FOLIO_AI_GEMINI_APIKEY?: string;
    GEMINI_API_KEY?: string;
    FOLIO_AI_GEMINI_MODEL?: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const url = new URL(request.url);
        if (url.pathname !== "/ai") {
            return new Response("Not Found", { status: 404 });
        }

        try {
            const { prompt } = await request.json() as { prompt: string };
            const apiKey = env.FOLIO_AI_GEMINI_APIKEY || env.GEMINI_API_KEY;
            const model = env.FOLIO_AI_GEMINI_MODEL || "gemini-2.0-flash";

            if (!apiKey) {
                return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (!prompt) {
                return new Response(JSON.stringify({ error: "Prompt is required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const response = await generateElements(apiKey, prompt, schema, model);
            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ error: "Failed to generate elements" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    },
};
