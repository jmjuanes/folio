import elementSchema from "../schema/element.schema.json" with { type: "json" };
import assetSchema from "../schema/asset.schema.json" with { type: "json" };

export enum AssistantRoles {
    SYSTEM = "system",
    DEVELOPER = "developer",
    USER = "user",
    ASSISTANT = "assistant",
};

export type GenerateElementsParams = {
    prompt: string;
};

export type AssistantParams = {
    baseUrl?: string;
    apiKey: string;
    model: string;
};

export enum MessageType {
    TEXT = "text",
    ELEMENTS = "elements",
};

export enum MessageRoles {
    ASSISTANT = AssistantRoles.ASSISTANT,
    USER = AssistantRoles.USER,
};

export type Message = {
    role: MessageRoles;
    type: MessageType;
    content: any;
};

export type AssistantBlock = {
    type: MessageType;
    content: any;
};

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<any>;
};

type GenerateContentParams = {
    prompt: string;
    responseSchema: any;
    systemInstructions?: string[];
    messages?: Message[];
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams): Assistant => {
    // const baseUrl = assistantParams?.baseUrl || "https://api.groq.com/openai/v1";
    // const maxMessagesInRequest = assistantParams?.maxRequestMessages ?? 50;
    const generateContent = async (options: GenerateContentParams): Promise<any> => {
        // 1. generate the list of messages to pass to the AI
        // const warnings: AssistantWarning[] = [];
        const messages = [];
        // 1.1 insert system instructions
        (options?.systemInstructions || []).forEach((instructionContent: string) => {
            messages.push({
                role: AssistantRoles.DEVELOPER,
                content: instructionContent,
            });
        });
        // 1.2. include additional instructions
        messages.push({
            role: AssistantRoles.DEVELOPER,
            content: "Only return valid JSON. Do not include any other text or markdown formatting.",
        });
        // 1.3. insert history messages
        if (options?.messages && Array.isArray(options.messages)) {
            // check the number of assistant messages
            // if (options.messages.length > maxMessagesInRequest) {
            //     warnings.push({
            //         message: `Only the last ${maxMessagesInRequest} messages has been used in the request.`,
            //     });
            // }
            // include only the last n messages in the request
            // options.messages.slice((-1) * maxMessagesInRequest).forEach((message: Message) => {
            options.messages.forEach((message: Message) => {
                if (message.type === MessageType.TEXT) {
                    messages.push({
                        role: message.role,
                        content: message.content,
                    });
                }
                if (message.type === MessageType.ELEMENTS) {
                    messages.push({
                        role: message.role,
                        content: JSON.stringify({ elements: message.content }),
                    });
                }
            });
        }
        // 1.4. insert user prompt
        messages.push({
            role: AssistantRoles.USER,
            content: options.prompt,
        });
        // 2. perform the request to the provider
        const response = await fetch(`${assistantParams.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${assistantParams.apiKey}`,
            },
            body: JSON.stringify({
                model: assistantParams.model,
                messages: messages,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "elements_schema",
                        strict: false,
                        schema: options.responseSchema,
                    },
                },
            }),
        });
        // check for error performing the request
        if (!response.ok) {
            const error = await response.json();
            console.error(error);
            return Promise.reject(error);
        }
        // parse the response and return as an assistant result object
        const result: any = await response.json();
        return JSON.parse(result?.choices?.[0]?.message?.content || "{}");
    };

    return {
        generateElements: (params: GenerateElementsParams): Promise<any> => {
            const systemInstructions = [
                "You are a professional AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
                // Element type selection rules
                "Use 'shape' elements to create basic geometric figures like rectangles, circles (ellipses), diamonds, or triangles. Shapes can also contain text inside.",
                "Use 'arrow' elements for ANY straight line, arrow, connector, or line segment. This includes horizontal lines, vertical lines, diagonal lines, and arrows with or without arrowheads. NEVER use 'draw' for straight lines.",
                "Use 'text' elements to create standalone text that is not inside a shape (for example titles, labels, or annotations).",
                "Use 'draw' elements ONLY for complex freehand shapes that cannot be represented with 'shape' or 'arrow'. Examples: a star, a heart, a hand-drawn icon, or an artistic sketch like a cat or a tree. Each 'draw' element is a single path composed of points connected by smooth curves.",
                "IMPORTANT: Always prefer 'shape' and 'arrow' over 'draw'. Use 'draw' only when the desired figure cannot be built with shapes and arrows.",
                // Draw element coordinate rules
                "For 'draw' elements: the 'points' field must contain objects with 'x' and 'y' properties using absolute canvas coordinates (e.g., [{\"x\":100,\"y\":100},{\"x\":150,\"y\":200},{\"x\":200,\"y\":100}]). Set x1, y1, x2, y2 all to 0 — they will be automatically recalculated from the points. Provide enough points to define the shape smoothly (at least 8-10 points for curves, more for complex shapes). Close the path by repeating the first point at the end if the shape should be closed.",
                // Response format rules
                // "In the response, include a text block (textBlock) to explain the generated response like a professional assistant. This message must be friendly, concise, and helpful. Do not repeat the user's text verbatim.",
                // "You can provide multiple text parts and multiple elements parts in the same response if needed.",
            ];
            return generateContent({
                systemInstructions: systemInstructions,
                prompt: params.prompt,
                responseSchema: {
                    type: "object",
                    properties: {
                        summary: {
                            type: "string",
                            description: "a short summary of the user request (max 6 words)",
                        },
                        content: {
                            type: "array",
                            description: "an array of elements that were generated",
                            items: elementSchema,
                        },
                    },
                    required: ["summary", "content"],
                    additionalProperties: false,
                },
            });
        },
    } as Assistant;
};
