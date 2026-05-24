import elementSchema from "../schema/element.schema.json" with { type: "json" };
import type { AIProvider, GenerateElementsParams, GenerateElementsResult } from "./types.ts";

const BASE_INSTRUCTIONS = [
    "You are a professional AI assistant for a digital whiteboard application called Folio.",
    "Your goal is to help the user generate and transform elements for their whiteboard based on their requests.",
];

const ELEMENT_INSTRUCTIONS = [
    // Element type selection
    "Use 'shape' elements to create basic geometric figures like rectangles, circles (ellipses), diamonds, or triangles. Shapes can also contain text inside.",
    "Use 'arrow' elements for ANY straight line, arrow, connector, or line segment. This includes horizontal lines, vertical lines, diagonal lines, and arrows with or without arrowheads.",
    "NEVER use 'draw' for straight lines.",
    "Use 'text' elements to create standalone text that is not inside a shape (for example titles, labels, or annotations).",
    "Use 'draw' elements ONLY for complex freehand shapes that cannot be represented with 'shape' or 'arrow'.",
    "Examples of 'draw': a star, a heart, a hand-drawn icon, or an artistic sketch like a cat or a tree.",
    "Each 'draw' element is a single path composed of points connected by smooth curves.",
    "IMPORTANT: Always prefer 'shape' and 'arrow' over 'draw'. Use 'draw' only when the desired figure cannot be built with shapes and arrows.",
    // Draw element coordinate rules
    "For 'draw' elements: the 'points' field must contain objects with 'x' and 'y' properties using absolute canvas coordinates (e.g., [{\"x\":100,\"y\":100}]).",
    "Set x1, y1, x2, y2 all to 0 for 'draw' elements — they will be automatically recalculated from the points.",
    "Provide enough points to define the shape smoothly (at least 8-10 points for curves, more for complex shapes).",
    "Close the path by repeating the first point at the end if the shape should be closed.",
];

const GENERATE_ELEMENTS_SCHEMA = {
    type: "object",
    properties: {
        elements: {
            type: "array",
            description: "Array of elements to insert into the whiteboard.",
            items: elementSchema,
        },
    },
    required: [
        "elements",
    ],
    additionalProperties: false,
};

export type Assistant = {
    generateElements: (params: GenerateElementsParams) => Promise<GenerateElementsResult>;
};

// Creates an Assistant that orchestrates whiteboard actions.
// The Assistant is provider-agnostic: it only knows about the AIProvider interface.
export const createAssistant = (provider: AIProvider): Assistant => {
    return {
        generateElements: async (params: GenerateElementsParams): Promise<GenerateElementsResult> => {
            const result = await provider.generateStructuredContent({
                instructions: [...BASE_INSTRUCTIONS, ...ELEMENT_INSTRUCTIONS],
                input: params.prompt,
                responseSchema: GENERATE_ELEMENTS_SCHEMA,
            });
            return {
                elements: result.elements ?? [],
            };
        },
    };
};
