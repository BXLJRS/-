
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API key is missing. AI features will not work.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const suggestDebateTopics = async (category: string) => {
  const aiInstance = getAI();
  if (!aiInstance) {
    return [];
  }

  const response = await aiInstance.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give me 3 interesting debate topics about ${category}. Each should have two opposing views.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            sideA: { type: Type.STRING },
            sideB: { type: Type.STRING }
          },
          required: ["title", "sideA", "sideB"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};
