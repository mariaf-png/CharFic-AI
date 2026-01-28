
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  // Tenta pegar a chave do process.env (Vite) ou de uma variável global se injetada pelo Capacitor
  const apiKey = process.env.API_KEY || (window as any).GEMINI_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    console.error("DEBUG: API_KEY NÃO ENCONTRADA.");
    return "⚠️ CHAVE DE API AUSENTE: O app não encontrou sua chave do Gemini. No Android, verifique se você definiu a variável de ambiente antes do build.";
  }

  const ai = new GoogleGenAI({ apiKey });
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

    return response.text || "A IA não conseguiu gerar uma resposta.";
  } catch (error: any) {
    console.error("DETALHES DO ERRO NO ANDROID:", error);
    return `Erro de Conexão: ${error.message || "A IA está temporariamente indisponível."}`;
  }
}
