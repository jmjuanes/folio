import { GoogleGenAI, createModelContent, createUserContent } from "@google/genai";
import type { Content } from "@google/genai";

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

export type Message = {
    role: Roles;
    elements?: any[];
    text?: string;
};

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<any>;
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams): Assistant => {
    const ai = new GoogleGenAI({
        apiKey: assistantParams.apiKey,
    });
    const generateContent = (options: any): Promise<any> => {
        return ai.models.generateContent({ ...options, model: assistantParams.model }).then(result => {
            return JSON.parse(result.text) as any;
        });
    };
    return {
        generateElements: (params: GenerateElementsParams): Promise<any> => {
            const systemInstructions = [
                "You are an AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
                "Only return valid JSON. Do not include any other text or markdown formatting.",
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
            contentItems.push(createUserContent(params.prompt));
            // generate content based on the chat history
            return generateContent({
                contents: contentItems.filter(Boolean),
                config: {
                    systemInstruction: systemInstructions.join(" "),
                    responseMimeType: "application/json",
                    responseJsonSchema: {
                        type: "array",
                        items: elementSchema,
                    },
                },
            });
        },
    } as Assistant;
};
