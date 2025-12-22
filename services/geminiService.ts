
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
const MODEL_TEXT_FLASH = 'gemini-3-flash-preview';
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
 * Выполняет запрос с автоматическим откатом на Flash модель, 
 * если основная модель (Pro) перегружена или превысила лимиты.
 */
async function generateWithFallback(prompt: string, schema: any, useSearch = true) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Первая попытка: Gemini 3 Pro (Умная, но строгие лимиты)
    console.info("AI: Попытка запроса к Pro-модели...");
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_PRO,
      contents: prompt,
      config: { 
        tools: useSearch ? [{ googleSearch: {} }] : [],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return response.text;
  } catch (e: any) {
    if (e.message?.includes("429") || e.message?.includes("quota")) {
      console.warn("AI: Лимит Pro превышен, переключаюсь на Flash...");
      // Вторая попытка: Gemini 3 Flash (Быстрая, высокие лимиты)
      const flashResponse = await ai.models.generateContent({
        model: MODEL_TEXT_FLASH,
        contents: prompt,
        config: { 
          tools: useSearch ? [{ googleSearch: {} }] : [],
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      return flashResponse.text;
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
  const prompt = `Ты — экспертный бизнес-консультант. Отрасли: ${industries.join(', ')}. Отдел: ${dept}. Роль: ${role}. Ситуация: ${context}. Сгенерируй 8 идей IT-решений для устранения финансовых потерь. Верни строго JSON массив.`;
  
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

  const text = await generateWithFallback(prompt, schema);
  if (!text) throw new Error("AI вернул пустой ответ");
  return safeJsonParse(text);
};

export const expandIndustryNode = async (label: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разбей направление "${label}" на 5-7 конкретных процессов. Только JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH, // Для простых задач всегда используем Flash
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
      contents: { parts: [{ text: `High-tech SaaS dashboard for: ${prompt}. Minimalist, 4k.` }] }
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
  const prompt = `Глубокий аудит для: ${idea.title}. Опиши диагностику, смету и roadmap. Только JSON.`;
  const text = await generateWithFallback(prompt, { type: Type.OBJECT }, true);
  return safeJsonParse(text || "{}");
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const prompt = `Landing content for ${idea.title}. Founder ${contacts.name}. JSON output.`;
  const text = await generateWithFallback(prompt, { type: Type.OBJECT }, false);
  return safeJsonParse(text || "{}");
};
