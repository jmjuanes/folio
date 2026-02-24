import elementSchema from "../schema/element.schema.json" with { type: "json" };
import assetSchema from "../schema/asset.schema.json" with { type: "json" };

const defaultJsonSchema: any = {
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
};

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
};

export type AssistantResponse = {
    text?: string;
    elements?: any[];
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
    generateElements: (params: GenerateElementsParams) => Promise<AssistantResponse>;
};

type GenerateContentParams = {
    systemInstructions?: string;
    prompt: string;
    messages?: Message[];
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams): Assistant => {
    const baseUrl = assistantParams?.baseUrl || "https://api.groq.com/openai/v1";

    const generateContent = async (options: GenerateContentParams): Promise<AssistantResponse> => {
        // 1. generate the list of messages to pass to the AI
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
        messages.push({
            role: AssistantRoles.DEVELOPER,
            content: [
                "Use 'shape' elements to create basic figures like a rectangle, circle, or triangle. Note that 'shape' elements can include also text inside.",
                "Use 'arrow' elements to create simple lines, arrows, and connectors.",
                "Use 'text' elements to create text when it is not included inside a 'shape' element (for example a title or a label).",
                // "Use 'draw' elements to create freehand drawings. For example, if the user asks for a 'drawing of a cat', use a 'draw' element to create the drawing.",
                "Use 'draw' elements to create more complex figures. Draw elements are composed of a list of points, which are connected by lines. Each 'draw' element is a single path.",
                "Do not use a 'draw' element if the request can be satisfied using 'shape', 'arrow', or 'text' elements (for example, to draw a single line or an arrow use an 'arrow' element, not a 'draw' element).",
            ].join(" "),
        });
        // 1.3. insert history messages
        if (options?.messages) {
            options.messages.forEach((message: Message) => {
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
                        schema: defaultJsonSchema,
                    },
                },
            }),
        });
        // check for error performing the request
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // parse the response
        const result = await response.json();
        // return the generated elements
        return JSON.parse(result.choices[0].message.content) as AssistantResponse;
    };
    return {
        generateElements: (params: GenerateElementsParams): Promise<AssistantResponse> => {
            const systemInstructions = [
                "You are an AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
            ];
            return generateContent({
                systemInstructions: systemInstructions.join(" "),
                prompt: params.prompt,
                messages: params?.messages || [],
            });
        },
    } as Assistant;
};
