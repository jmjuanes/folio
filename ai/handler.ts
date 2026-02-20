import { GoogleGenAI } from "@google/genai";

export interface AIResponse {
    elements: any[];
    text?: string;
}

export const generateElements = async (apiKey: string, prompt: string, schema: any, model: string = "gemini-2.0-flash"): Promise<AIResponse> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an AI assistant for a digital whiteboard application called Folio.
Your goal is to help the user generate elements for their whiteboard based on their requests.
You must return a JSON object with the following structure:
{
  "elements": [], // An array of elements follow the provided schema
  "text": "" // A brief message explaining what you generated
}

The elements must strictly follow this JSON schema:
${JSON.stringify(schema, null, 2)}

Only return valid JSON. Do not include any other text or markdown formatting.
`;

    const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
            responseMimeType: "application/json",
        },
    });

    const responseText = result.text;

    if (!responseText) {
        throw new Error("Empty response from AI");
    }

    try {
        return JSON.parse(responseText) as AIResponse;
    } catch (e) {
        console.error("Failed to parse AI response:", responseText);
        throw new Error("Invalid response from AI");
    }
};
