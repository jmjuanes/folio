import { GoogleGenAI, Content } from "@google/genai";
import elementSchema from "../schema/element.schema.json" with { type: "json" };
import assetSchema from "../schema/asset.schema.json" with { type: "json" };

export type AiResponse = {
    elements?: any[] | null;
    assets?: any[] | null;
    text?: string | null;
};

export type ChatMessage = AiResponse & {
    role: string;
};

export type ChatMessageOptions = {
    apiKey: string;
    model: string;
    prompt: string;
    history?: ChatMessage[];
};

const responseSchema = {
    type: "object",
    description: "response object",
    properties: {
        text: {
            type: "string",
            description: "Brief description of the generated stuff",
        },
        elements: {
            type: "array",
            description: "list of visual elements",
            items: elementSchema,
        },
        // assets: {
        //     type: "array",
        // },
    },
};

// tiny utility to generate the part object
const buildContent = (role: string, contentText: string): Content => {
    return {
        role: role,
        parts: [
            { text: contentText },
        ],
    };
};

// @description internal method to generate internal system instructions
const getSystemInstructions = (): Content => {
    const systemInstructionText = [
        "You are an AI assistant for a digital whiteboard application called Folio.",
        "Your goal is to help the user generate elements for their whiteboard based on their requests.",
        "Only return valid JSON. Do not include any other text or markdown formatting.",
    ];
    return buildContent("system", systemInstructionText.join("\n"));
};

// @description generate response por the provided chat
export const generateChatMessage = (options: ChatMessageOptions): Promise<AIResponse> => {
    const ai = new GoogleGenAI({
        apiKey: options.apiKey,
    });
    // parse history
    const content: Content[] = (options.history || []).map((entry: ChatMessage) => {
        const { role, ...messageContent } = entry;
        if (role === "user") {
            return buildContent("user", messageContent.text);
        }
        // parse from system response
        return buildContent("model", JSON.stringify(messageContent));
    });
    // add prompt as a new history entry
    content.push(buildContent("user", options.prompt));
    // generate content based on the chat history
    const generateContentOptions = {
        model: options.model,
        contents: content,
        config: {
            systemInstruction: getSystemInstructions(),
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    };
    return ai.models.generateContent(generateContentOptions).then(result => {
        return JSON.parse(result.text) as AiResponse;
    });
};
