import { Provider } from "../constants.ts";
import { AIProviderError, AIParseError } from "../types.ts";
import type { AIProvider, GenerateStructuredContentParams, AIProviderConfig } from "../types.ts";

// default base URLs per compatible provider
const BASE_URLS: Record<string, string> = {
    [Provider.OpenAI]: "https://api.openai.com/v1",
    [Provider.Groq]: "https://api.groq.com/openai/v1",
    [Provider.OpenRouter]: "https://openrouter.ai/api/v1",
};

// extracts the generated text from an OpenAI Responses API response object.
// https://platform.openai.com/docs/api-reference/responses
const parseResponse = (responseObject: any): string => {
    const parts: string[] = [];
    for (const output of responseObject.output ?? []) {
        if (output.type === "message" && Array.isArray(output.content)) {
            for (const content of output.content) {
                if (content.type === "output_text" && typeof content.text === "string") {
                    parts.push(content.text);
                }
            }
        }
    }
    return parts.join("");
};


// AI provider for OpenAI Responses API.
// Also works with Groq and OpenRouter, which expose a compatible implementation.
export const createOpenAIProvider = (config: AIProviderConfig): AIProvider => {
    const baseUrl = config.baseUrl || BASE_URLS[config.provider];
    return {
        async generateStructuredContent(params: GenerateStructuredContentParams): Promise<any> {
            const response = await fetch(`${baseUrl}/responses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    instructions: params.instructions.join("\n"),
                    input: params.input,
                    store: false,
                    text: {
                        format: {
                            type: "json_schema",
                            name: "folio_response_schema",
                            strict: true,
                            schema: params.responseSchema,
                        },
                    },
                }),
            });

            if (!response.ok) {
                console.error(await response.text().catch(() => null));
                throw new AIProviderError(config.provider, response.status, await response.json().catch(() => null));
            }

            const raw = parseResponse(await response.json());

            try {
                return JSON.parse(raw || "{}");
            } catch {
                throw new AIParseError(config.provider, raw);
            }
        },
    };
};
