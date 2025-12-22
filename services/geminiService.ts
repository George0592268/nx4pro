
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
const MODEL_TEXT_FLASH = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

/**
 * Вспомогательная функция для безопасного извлечения JSON из ответа.
 * Иногда модель возвращает JSON внутри блоков ```json ... ``` даже при запросе mimeType: application/json.
 */
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

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  console.info("AI Request: Starting generation...");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Ты — экспертный бизнес-консультант и архитектор IT-решений.
  
  КОНТЕКСТ:
  - Отрасли: ${industries.join(', ')}
  - Целевой отдел: ${dept}
  - Роль пользователя: ${role}
  - Ситуация: ${context || "Стандартная оптимизация"}
  - Стадия бизнеса: ${stage}
  
  ЗАДАЧА:
  Найди 8 конкретных "болей" (финансовых потерь) и предложи IT-продукты для их решения.
  Каждое решение должно иметь:
  1. problemStatement: Острая бизнес-боль (например, "Потеря 15% лидов из-за медленного ответа").
  2. rootCauses: 3 причины, почему это происходит сейчас.
  3. title: Название IT-решения.
  4. roiEstimate: Оценка окупаемости (например, "3-4 месяца").
  5. priorityScore: Число от 1 до 100 (уровень критичности).
  
  ВАЖНО: Верни СТРОГО массив JSON. Не пиши ничего, кроме JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_PRO, // Используем Pro для более точного следования формату
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI вернул пустой ответ (возможно, сработали фильтры безопасности)");
    
    return safeJsonParse(text);
  } catch (e: any) {
    console.error("Critical AI Error:", e);
    // Пробрасываем детали ошибки для отображения в UI
    throw new Error(e.message || "Неизвестная ошибка Gemini API");
  }
};

export const expandIndustryNode = async (label: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разбей направление "${label}" на 5-7 конкретных процессов. Только JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["label", "type"]
          }
        }
      }
    });
    return safeJsonParse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: `Professional SaaS dashboard UI/UX concept for: ${prompt}. Blue corporate style, clean, 4k.` }]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) { return null; }
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Глубокий аудит для: ${idea.title}. Опиши диагностику, смету и roadmap. Только JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_PRO,
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    return safeJsonParse(response.text || "{}");
  } catch (e) { return {}; }
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Landing content for ${idea.title}. Founder ${contacts.name}. Only JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return safeJsonParse(response.text || "{}");
  } catch (e) {
    return { headline: "Error", subheadline: "", benefits: [], features: [], cta: "", painPoints: [], founderStory: "" };
  }
};
