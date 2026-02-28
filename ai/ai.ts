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
        text?: string;
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
    systemInstructions?: string;
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
        if (options?.systemInstructions) {
            messages.push({
                role: AssistantRoles.DEVELOPER,
                content: options.systemInstructions,
            });
        }
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
                        strict: true,
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
        const result = await response.json();
        return {
            content: JSON.parse(result.choices[0].message.content),
            warnings: warnings,
        } as AssistantResult;
    };
    return {
        generateElements: (params: GenerateElementsParams): Promise<AssistantResult> => {
            const systemInstructions = [
                "You are an AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
                "Use 'shape' elements to create basic figures like a rectangle, circle, or triangle. Note that 'shape' elements can include also text inside.",
                "Use 'arrow' elements to create simple lines, arrows, and connectors.",
                "Use 'text' elements to create text when it is not included inside a 'shape' element (for example a title or a label).",
                // "Use 'draw' elements to create freehand drawings. For example, if the user asks for a 'drawing of a cat', use a 'draw' element to create the drawing.",
                "Use 'draw' elements to create more complex figures. Draw elements are composed of a list of points, which are connected by lines. Each 'draw' element is a single path.",
                "Do not use a 'draw' element if the request can be satisfied using 'shape', 'arrow', or 'text' elements (for example, to draw a single line or an arrow use an 'arrow' element, not a 'draw' element).",
            ];
            return generateContent({
                systemInstructions: systemInstructions.join(" "),
                prompt: params.prompt,
                messages: params?.messages || [],
                responseSchema: {
                    type: "object",
                    properties: {
                        text: {
                            type: "string",
                            description: "a brief description of the elements that were generated",
                        },
                        elements: {
                            type: "array",
                            description: "an array of elements that were generated",
                            items: elementSchema,
                        },
                    },
                    required: ["text", "elements"],
                    additionalProperties: false,
                },
            });
        },
    } as Assistant;
};
