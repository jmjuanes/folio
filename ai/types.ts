import { Provider } from "./constants.ts";

export type GenerateElementsParams = {
    prompt: string;
};

export type GenerateElementsResult = {
    elements: any[];
};

export type GenerateStructuredContentParams = {
    input: string;
    instructions: string[];
    responseSchema: Record<string, any>;
};

// Common interface that every AI provider must implement.
// The Assistant only knows about this interface, never about provider internals.
export interface AIProvider {
    generateStructuredContent(params: GenerateStructuredContentParams): Promise<any>;
};

export type AIProviderConfig = {
    provider: Provider;
    apiKey: string;
    model: string;
    baseUrl?: string; // override default endpoint if needed
};

export class AIProviderError extends Error {
    constructor(
        public readonly provider: string,
        public readonly status: number,
        public readonly body: unknown,
    ) {
        super(`[${provider}] Request failed with status ${status}`);
        this.name = "AIProviderError";
    }
};

export class AIParseError extends Error {
    constructor(
        public readonly provider: string,
        public readonly raw: string,
    ) {
        super(`[${provider}] Failed to parse structured response`);
        this.name = "AIParseError";
    }
};
