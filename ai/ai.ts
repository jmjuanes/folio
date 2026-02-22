import { GoogleGenAI, createModelContent, createUserContent } from "@google/genai";
import elementSchema from "../schema/element.schema.json" with { type: "json" };
import assetSchema from "../schema/asset.schema.json" with { type: "json" };

export enum Roles {
    ASSISTANT = "assistant",
    USER = "user",
};

export type GenerateElementsParams = {
    prompt: string;
    messages?: Message[];
};

export type AssistantParams = {
    apiKey: string;
    model: string;
};

export type AssistantResponse = {
    elements?: any[] | null;
    assets?: any[] | null;
    text?: string | null;
};

export type Message = AssistantResponse & {
    role: Roles;
};

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<AssistantResponse>;
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams = {}): Assistant => {
    const ai = new GoogleGenAI({
        apiKey: assistantParams.apiKey,
    });
    const generateContent = (options: any): Promise<AssistantResponse> => {
        return ai.models.generateContent({ ...options, model: assistantParams.model }).then(result => {
            return JSON.parse(result.text) as AssistantResponse;
        });
    };
    return {
        generateElements: (params: GenerateElementsParams): Promise<AssistantResponse> => {
            const systemInstructions = [
                "You are an AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
                "Only return valid JSON. Do not include any other text or markdown formatting.",
                "Only use available elements and properties defined in the response schema.",
            ];
            // parse messages from history
            const contentItems: Content[] = (params?.messages || []).map((entry: Message) => {
                const { role, ...messageContent } = entry;
                if (role === Roles.USER) {
                    return createUserContent(messageContent.text);
                }
                else if (role === Roles.ASSISTANT) {
                    return createModelContent(JSON.stringify(messageContent));
                }
                return null;
            });
            // add prompt as a new history entry
            contentItems.push(createUserContent(options.prompt));
            // generate content based on the chat history
            return generateContent({
                contents: contentItems.filter(Boolean),
                config: {
                    systemInstruction: systemInstructions.join(" "),
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        description: "response object",
                        properties: {
                            text: {
                                type: "string",
                                description: "Brief description of the generated stuff",
                            },
                            elements: {
                                type: "array",
                                description: "list of elements generated",
                                items: elementSchema,
                            },
                        },
                    },
                },
            });
        },
    } as Assistant;
};
