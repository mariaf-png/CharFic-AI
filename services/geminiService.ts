
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  // Obter a chave diretamente do ambiente. Se não houver, o SDK falhará normalmente.
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
    
    if (errorMsg.includes("API key not valid") || errorMsg.includes("Requested entity was not found") || errorMsg.includes("403") || errorMsg.includes("401")) {
      return "⚠️ Erro de Autorização: A chave de API configurada no sistema parece ser inválida ou não tem permissão para este modelo.";
    }
    
    if (errorMsg.includes("rate limit") || errorMsg.includes("429")) {
      return "⚠️ Limite Excedido: Muitas requisições em pouco tempo. Aguarde um instante.";
    }

    return `Erro de Conexão: ${errorMsg || "A IA está temporariamente indisponível."}`;
  }
}
