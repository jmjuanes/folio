import { AIProvider, AIProviderError, AIParseError, GenerateStructuredContentParams, AIProviderConfig } from "../types.ts";

// minimum Anthropic API version that supports structured JSON output via tools
const ANTHROPIC_VERSION = "2023-06-01";
const BASE_URL = "https://api.anthropic.com/v1";

// Builds a JSON schema tool definition for Anthropic's tool_use API.
// We use a single forced tool call to get structured JSON output,
// which is the idiomatic way to do structured output with Anthropic's API.
// https://docs.anthropic.com/en/docs/build-with-claude/tool-use
const buildStructuredOutputTool = (schema: Record<string, any>) => {
    return {
        name: "folio_structured_output",
        description: "Returns a structured JSON response following the given schema.",
        input_schema: schema,
    };
};

// Extracts the structured JSON from an Anthropic tool_use response.
const parseResponse = (responseObject: any): any => {
    for (const block of responseObject.content ?? []) {
        if (block.type === "tool_use" && block.name === "folio_structured_output") {
            return block.input ?? {};
        }
    }
    return {};
};

// AI provider for Anthropic Messages API.
// Uses tool_use with tool_choice: "any" to force structured JSON output.
export const createAnthropicProvider = (config: AIProviderConfig): AIProvider => {
    return {
        async generateStructuredContent(params: GenerateStructuredContentParams): Promise<any> {
            const tool = buildStructuredOutputTool(params.responseSchema);
            const response = await fetch(`${BASE_URL}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": config.apiKey,
                    "anthropic-version": ANTHROPIC_VERSION,
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: 4096,
                    system: params.instructions.join("\n"),
                    messages: [
                        { role: "user", content: params.input },
                    ],
                    tools: [tool],
                    // Force the model to always call our structured output tool
                    tool_choice: {
                        type: "any",
                    },
                }),
            });

            if (!response.ok) {
                throw new AIProviderError("anthropic", response.status, await response.json().catch(() => null));
            }

            try {
                return parseResponse(await response.json());
            } catch {
                throw new AIParseError("anthropic", "<unparseable response>");
            }
        },
    };
};
