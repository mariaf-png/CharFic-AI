
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const modelName = 'gemini-3-flash-preview';
  
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const recentContext = messages.length > 4 
    ? `\n\nLEMBRETE DE CONTINUIDADE (MEMÓRIA ATIVA):\nConsidere os eventos, nomes de personagens e detalhes mencionadas nas últimas interações para manter a coerência narrativa total.`
    : "";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(modelType, universe) + recentContext,
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text || "A IA não conseguiu gerar uma resposta. Tente reformular seu último pedido.";
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    
    const errorMsg = error.message || "";
    if (errorMsg.includes("rate limit") || errorMsg.includes("429")) {
      return "⚠️ Limite Excedido: Muitas requisições em pouco tempo. Aguarde um instante.";
    }

    return `Erro de Conexão: A IA está temporariamente indisponível. Verifique sua conexão.`;
  }
}
