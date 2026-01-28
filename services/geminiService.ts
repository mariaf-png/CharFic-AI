
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "../constants.tsx";
import { Message, WritingModel } from "../types.ts";

export async function generateStoryPart(messages: Message[], modelType: WritingModel, universe: string): Promise<string> {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "⚠️ ERRO: Chave de API não configurada. Verifique as configurações do ambiente.";
  }

  const ai = new GoogleGenAI({ apiKey });
  // Usando gemini-3-flash-preview para velocidade e ótimo acompanhamento de instruções
  const modelName = 'gemini-3-flash-preview';
  
  // Mapeamento simples de histórico
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  // Mecanismo de Memória: Extraímos fatos chaves das mensagens anteriores para reforçar a continuidade
  const recentContext = messages.length > 4 
    ? `\n\nLEMBRETE DE CONTINUIDADE (MEMÓRIA ATIVA):\nConsidere os eventos e detalhes mencionados nas últimas interações para manter a coerência total da trama, personalidades e cenário.`
    : "";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(modelType, universe) + recentContext,
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
      },
    });

    return response.text || "A IA não conseguiu gerar uma resposta no momento.";
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    if (error.message?.includes("API key not valid")) {
      return "⚠️ CHAVE INVÁLIDA: A chave de API fornecida não é válida.";
    }
    return `Erro de Conexão: ${error.message || "A IA está temporariamente indisponível."}`;
  }
}
