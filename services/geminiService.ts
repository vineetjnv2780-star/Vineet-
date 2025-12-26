import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
// Note: process.env.API_KEY is expected to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Solves a math problem or conversion request using Gemini.
 * We use the 'gemini-3-flash-preview' model for fast, logical text tasks.
 */
export const solveWithAI = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a calculator assistant. Solve the following math problem or unit conversion. 
      Return ONLY the numerical answer or the concise result (e.g., "42" or "100 kg"). 
      Do not show work. Do not add markdown formatting like **bold**.
      
      Input: ${prompt}`,
    });

    return response.text?.trim() || "Error";
  } catch (error) {
    console.error("Gemini calculation error:", error);
    return "Error";
  }
};