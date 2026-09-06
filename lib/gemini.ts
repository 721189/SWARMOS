import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  // We don't throw here to prevent server crash on startup if key is missing
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
