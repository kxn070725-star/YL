import { GoogleGenAI, Type } from "@google/genai";
import { ThemeResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTheme = async (prompt: string): Promise<ThemeResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a visual theme based on this description: "${prompt}"`,
      config: {
        systemInstruction: `You are a holographic UI designer and holiday decorator. 
        Generate a color palette of 5 hex codes that match the user's requested theme. 
        Also write a short, creative, 2-sentence holiday greeting that fits the vibe.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 5 hex color strings"
            },
            greeting: {
              type: Type.STRING,
              description: "A short holiday greeting matching the theme"
            },
            musicMood: {
              type: Type.STRING,
              description: "A short adjective describing the mood (e.g., 'Energetic', 'Serene', 'Mystical')"
            }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Clean up potential markdown formatting
    text = text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    return JSON.parse(text) as ThemeResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return {
      colors: ['#FF0000', '#00FF00', '#FFD700', '#FFFFFF', '#0000FF'],
      greeting: "Happy Holidays! (System Rebooting... Energy restored)",
      musicMood: "Traditional"
    };
  }
};