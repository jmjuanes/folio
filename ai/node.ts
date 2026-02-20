import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "@koa/bodyparser";
import dotenv from "dotenv";
import { generateElements } from "./handler.js";
import schema from "../schema/element.schema.json" with { type: "json" };

dotenv.config();

const app = new Koa();
const router = new Router();

router.post("/ai", async (ctx: any) => {
    const { prompt } = ctx.request.body as { prompt: string };
    const apiKey = process.env.FOLIO_AI_GEMINI_APIKEY || process.env.GEMINI_API_KEY;
    const model = process.env.FOLIO_AI_GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
        ctx.status = 500;
        ctx.body = { error: "GEMINI_API_KEY not configured" };
        return;
    }

    if (!prompt) {
        ctx.status = 400;
        ctx.body = { error: "Prompt is required" };
        return;
    }

    try {
        const response = await generateElements(apiKey, prompt, schema, model);
        ctx.body = response;
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: "Failed to generate elements" };
    }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.FOLIO_AI_PORT || process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`AI service running on http://localhost:${PORT}`);
});
