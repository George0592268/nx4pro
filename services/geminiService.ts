
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

// Используем максимально стабильные версии для бесплатных ключей
const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
const MODEL_TEXT_FLASH = 'gemini-flash-latest'; 
const MODEL_IMAGE = 'gemini-2.5-flash-image';

const safeJsonParse = (text: string) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Ошибка парсинга JSON из AI:", text);
    throw new Error("AI вернул некорректный формат данных. Попробуйте еще раз.");
  }
};

/**
 * Оптимизированный запрос: 
 * 1. Пытается выполнить запрос с поиском (если нужно).
 * 2. Если лимит превышен, делает мгновенный повтор БЕЗ поиска на Flash.
 */
async function aiRequest(prompt: string, schema: any, modelPrefer: 'pro' | 'flash' = 'flash', useSearch = true) {
  // Каждый раз создаем новый инстанс, чтобы подхватить актуальный ключ
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = modelPrefer === 'pro' ? MODEL_TEXT_PRO : MODEL_TEXT_FLASH;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { 
        // Поиск часто является причиной 429 ошибки на бесплатных ключах
        tools: useSearch ? [{ googleSearch: {} }] : [],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return response.text;
  } catch (e: any) {
    const isQuotaError = e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("limit");
    
    if (isQuotaError) {
      console.warn("Лимит превышен. Пробую аварийный режим Flash без поиска...");
      // Аварийный запрос: ОБЯЗАТЕЛЬНО Flash и ОБЯЗАТЕЛЬНО без Search. 
      // Это почти всегда срабатывает даже когда Pro лежит.
      const retryResponse = await ai.models.generateContent({
        model: MODEL_TEXT_FLASH,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      return retryResponse.text;
    }
    throw e;
  }
}

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  const prompt = `Ты бизнес-архитектор. Сгенерируй 8 IT-идей для: ${industries.join(', ')}. Отдел: ${dept}. Роль: ${role}. Контекст: ${context}. Верни JSON массив.`;
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        problemStatement: { type: Type.STRING },
        rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        department: { type: Type.STRING },
        roiEstimate: { type: Type.STRING },
        targetRole: { type: Type.STRING },
        priorityScore: { type: Type.INTEGER }
      },
      required: ["id", "problemStatement", "rootCauses", "title", "description", "department", "roiEstimate", "targetRole", "priorityScore"]
    }
  };

  // Для идей используем Flash сразу (высокие лимиты)
  const text = await aiRequest(prompt, schema, 'flash', true);
  return safeJsonParse(text || "[]");
};

export const expandIndustryNode = async (label: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разбей "${label}" на 5 процессов. JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return safeJsonParse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: `Modern SaaS UI for: ${prompt}. Blue/White, 4k.` }] }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return null; }
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  const prompt = `Глубокий бизнес-аудит для: ${idea.title}. Опиши диагностику, смету и roadmap. Используй Google Search для данных 2024. Только JSON.`;
  // Пытаемся через Pro, но теперь fallback на Flash без поиска сработает 100%
  const text = await aiRequest(prompt, { type: Type.OBJECT }, 'pro', true);
  return safeJsonParse(text || "{}");
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const prompt = `Landing content for ${idea.title}. Founder ${contacts.name}. JSON.`;
  const text = await aiRequest(prompt, { type: Type.OBJECT }, 'flash', false);
  return safeJsonParse(text || "{}");
};
