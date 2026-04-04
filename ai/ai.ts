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

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<any>;
};

type GenerateContentParams = {
    input: string;
    instructions?: string[];
    responseSchema: any;
};

// internal utility to parse a response object and extract the output generated text
// https://developers.openai.com/api/docs/guides/migrate-to-responses?lang=bash&structured-outputs=responses&update-item-definitions=responses&update-multiturn=responses#messages-vs-items
const parseResponse = (responseObject: any): string => {
    const responseText: string[] = [];
    (responseObject.output || []).forEach((output: any) => {
        if (output.type === "message" && output.content) {
            (output.content || []).forEach((content: any) => {
                if (content.type === "output_text") {
                    responseText.push(content.text);
                }
            });
        }
    });
    // concatenate all the response text parts
    return responseText.join("");
};

// @description create a new assitant instance
export const createAssistant = (assistantParams: AssistantParams): Assistant => {
    const generateContent = async (options: GenerateContentParams): Promise<any> => {
        const response = await fetch(`${assistantParams.baseUrl}/responses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${assistantParams.apiKey}`,
            },
            body: JSON.stringify({
                model: assistantParams.model,
                instructions: (options.instructions || []).join(" "),
                input: options.input,
                store: false,
                text: {
                    format: {
                        type: "json_schema",
                        name: "folio_response_schema",
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
        // parse the response and return as a JSON object
        const responseObject: any = await response.json();
        return JSON.parse(parseResponse(responseObject) || "{}");
    };

    return {
        generateElements: (params: GenerateElementsParams): Promise<any> => {
            const systemInstructions = [
                "You are a professional AI assistant for a digital whiteboard application called Folio.",
                "Your goal is to help the user generate elements for their whiteboard based on their requests.",
                // Element type selection rules
                "Use 'shape' elements to create basic geometric figures like rectangles, circles (ellipses), diamonds, or triangles. Shapes can also contain text inside.",
                "Use 'arrow' elements for ANY straight line, arrow, connector, or line segment. This includes horizontal lines, vertical lines, diagonal lines, and arrows with or without arrowheads.",
                "NEVER use 'draw' for straight lines.",
                "Use 'text' elements to create standalone text that is not inside a shape (for example titles, labels, or annotations).",
                "Use 'draw' elements ONLY for complex freehand shapes that cannot be represented with 'shape' or 'arrow'.",
                "Examples: a star, a heart, a hand-drawn icon, or an artistic sketch like a cat or a tree.",
                "Each 'draw' element is a single path composed of points connected by smooth curves.",
                "IMPORTANT: Always prefer 'shape' and 'arrow' over 'draw'. Use 'draw' only when the desired figure cannot be built with shapes and arrows.",
                // Draw element coordinate rules
                "For 'draw' elements: the 'points' field must contain objects with 'x' and 'y' properties using absolute canvas coordinates (e.g., [{\"x\":100,\"y\":100}]).",
                "Set x1, y1, x2, y2 all to 0 — they will be automatically recalculated from the points.",
                "Provide enough points to define the shape smoothly (at least 8-10 points for curves, more for complex shapes).",
                "Close the path by repeating the first point at the end if the shape should be closed.",
            ];
            return generateContent({
                instructions: systemInstructions,
                input: params.prompt,
                responseSchema: {
                    type: "object",
                    properties: {
                        // summary: {
                        //     type: "string",
                        //     description: "a short summary of the user request (max 6 words)",
                        // },
                        elements: {
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
