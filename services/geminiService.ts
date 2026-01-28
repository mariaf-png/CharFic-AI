
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  // Em apps Android, o process.env pode não ser injetado da mesma forma que na web.
  const apiKey = process.env.API_KEY;

  console.log("Tentando gerar história com API KEY:", apiKey ? "Configurada" : "AUSENTE");

  if (!apiKey || apiKey.length < 10) {
    return "⚠️ ERRO DE CONFIGURAÇÃO: Chave de API não encontrada. No Android, certifique-se de que o build foi feito com a chave presente.";
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
    console.error("Erro detalhado do Gemini no Android:", error);
    return `Erro na IA: ${error.message || "Verifique sua conexão"}`;
  }
}
