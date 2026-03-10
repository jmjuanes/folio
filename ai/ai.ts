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
    messages?: Message[];
};

export type AssistantParams = {
    baseUrl?: string;
    apiKey: string;
    model: string;
    maxMessagesInRequest?: number;
};

export type AssistantWarning = {
    message: string;
};

export type AssistantResult = {
    content: {
        title?: string | null;
        message?: string;
        elements?: any[];
    };
    warnings?: AssistantWarning[],
};

export enum MessageRoles {
    ASSISTANT = "assistant",
    USER = "user",
};

export type Message = {
    role: MessageRoles;
    elements?: any[];
    text?: string;
};

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<AssistantResult>;
};

type GenerateContentParams = {
    systemInstructions?: string[];
    prompt: string;
    responseSchema: any;
    messages?: Message[];
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams): Assistant => {
    const baseUrl = assistantParams?.baseUrl || "https://api.groq.com/openai/v1";
    const maxMessagesInRequest = assistantParams?.maxMessagesInRequest ?? 5;
    const generateContent = async (options: GenerateContentParams): Promise<AssistantResult> => {
        // 1. generate the list of messages to pass to the AI
        const warnings: AssistantWarning[] = [];
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
        if (options?.messages) {
            // check the number of assistant messages
            if (options.messages.length > maxMessagesInRequest) {
                warnings.push({
                    message: `Only the last ${maxMessagesInRequest} messages has been used in the request.`,
                });
            }
            // include only the last n messages ijn the request
            options.messages.slice((-1) * maxMessagesInRequest).forEach((message: Message) => {
                if (message.role === MessageRoles.USER) {
                    messages.push({
                        role: AssistantRoles.USER,
                        content: message.text,
                    });
                }
                if (message.role === MessageRoles.ASSISTANT) {
                    messages.push({
                        role: AssistantRoles.ASSISTANT,
                        content: JSON.stringify({ text: message.text, elements: message.elements }),
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
        const response = await fetch(`${baseUrl}/chat/completions`, {
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
            return Promise.reject(error);
        }
        // parse the response and return as an assistant result object
        const result: any = await response.json();
        return {
            content: JSON.parse(result?.choices?.[0]?.message?.content || "{}"),
            warnings: warnings,
        } as AssistantResult;
    };
    return {
        generateElements: (params: GenerateElementsParams): Promise<AssistantResult> => {
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
                "The main 'message' field of the response should be warm, concise, and helpful. It should sound like a friendly assistant. Do not repeat the user's text verbatim.",
            ];
            return generateContent({
                systemInstructions: systemInstructions,
                prompt: params.prompt,
                messages: params?.messages || [],
                responseSchema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "a short summary of the user request (max 6 words)",
                        },
                        message: {
                            type: "string",
                            description: "a friendly, conversational message to accompany the result",
                        },
                        elements: {
                            type: "array",
                            description: "an array of elements that were generated",
                            items: elementSchema,
                        },
                    },
                    required: ["title", "message", "elements"],
                    additionalProperties: false,
                },
            });
        },
    } as Assistant;
};
