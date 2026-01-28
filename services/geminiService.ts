
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  const modelName = 'gemini-3-pro-preview';
  
  const history = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: history,
      config: {
        systemInstruction: getSystemInstruction(modelType, universe),
        temperature: 0.85,
        topP: 0.95,
        topK: 64,
      },
    });

    return response.text || "Erro ao gerar resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro na IA. Verifique sua conexão ou tente novamente em instantes.";
  }
}
