import { Provider } from "../constants.ts";
import { createAnthropicProvider } from "./anthropic.ts";
import { createOpenAIProvider } from "./openai.ts";
import type { AIProvider, AIProviderConfig } from "../types.ts";

// genereric method to create an AI provider using config.provider
export const createProvider = (config: AIProviderConfig): AIProvider => {
    switch (config.provider) {
        case Provider.OpenAI:
        case Provider.Groq:
        case Provider.OpenRouter:
            return createOpenAIProvider(config);
        case Provider.Anthropic:
            return createAnthropicProvider(config);
        default:
            throw new Error(`Unrecognized provider ${config.provider}.`);
    }
};
