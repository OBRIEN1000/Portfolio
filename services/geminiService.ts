import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const summarizeText = async (text: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate summary.";
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `Summarize the following scientific abstract for a general audience (like a 5-year-old). Keep it brief and engaging:\n\n"${text}"`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error contacting AI service.";
  }
};

export const improveWriting = async (text: string): Promise<string> => {
  if (!apiKey) return text;
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `You are a professional editor for a scientific blog. Improve the grammar, flow, and clarity of the following text, but keep the tone authentic:\n\n"${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};

export const generateIdeas = async (topic: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model,
            contents: `Generate 3 interesting blog post ideas based on the research topic: "${topic}". Return them as a bulleted list.`
        });
        return response.text || "No ideas generated.";
    } catch (e) {
        return "Error generating ideas.";
    }
}
