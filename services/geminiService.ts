
import { GoogleGenAI } from "@google/genai";

export const getExecutiveSummary = async (data: any) => {
  // Fixed: Initializing GoogleGenAI inside the function to ensure it always uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this business productivity data and provide a concise, professional executive summary (under 150 words). 
        Include insights on task completion rates, attendance trends, and team performance.
        Data: ${JSON.stringify(data)}
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI summary at this time. Please check your data manually.";
  }
};
