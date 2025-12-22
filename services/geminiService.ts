
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
const MODEL_TEXT_FLASH = 'gemini-flash-latest'; 
const MODEL_IMAGE = 'gemini-2.5-flash-image';

const safeJsonParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    let cleanText = text.trim();
    // Очистка от markdown-блоков
    if (cleanText.includes("```")) {
      cleanText = cleanText.split(/```(?:json)?/)[1].split("```")[0].trim();
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    // Попытка найти JSON массив или объект внутри текста, если парсинг не удался
    try {
        const startArr = text.indexOf('[');
        const endArr = text.lastIndexOf(']');
        const startObj = text.indexOf('{');
        const endObj = text.lastIndexOf('}');
        
        if (startArr !== -1 && endArr !== -1 && (startArr < startObj || startObj === -1)) {
            return JSON.parse(text.substring(startArr, endArr + 1));
        } else if (startObj !== -1 && endObj !== -1) {
            return JSON.parse(text.substring(startObj, endObj + 1));
        }
    } catch (innerE) {
        return null;
    }
    return null;
  }
};

/**
 * Расширенный запрос.
 * ВАЖНО: Gemini API запрещает использовать responseMimeType: "application/json" 
 * одновременно с инструментами (tools), такими как googleSearch.
 */
async function aiRequest(prompt: string, schema: any, modelPrefer: 'pro' | 'flash' = 'flash', useSearch = true) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = modelPrefer === 'pro' ? MODEL_TEXT_PRO : MODEL_TEXT_FLASH;
  
  // Если используем поиск, мы ОБЯЗАНЫ отключить встроенный JSON-режим в конфиге
  // и полагаться на инструкцию в промпте.
  const config: any = {
    tools: useSearch ? [{ googleSearch: {} }] : [],
  };

  if (!useSearch) {
    config.responseMimeType = "application/json";
    config.responseSchema = schema;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt + (useSearch ? "\n\nОТВЕТЬ ТОЛЬКО В ФОРМАТЕ JSON, следуя схеме данных. Не пиши лишнего текста." : ""),
      config: config
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e: any) {
    const isQuotaError = e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("limit");
    
    if (isQuotaError) {
      // Аварийный режим: Flash без поиска (всегда работает на бесплатных ключах)
      const retryResponse = await ai.models.generateContent({
        model: MODEL_TEXT_FLASH,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      return { text: retryResponse.text, sources: [] };
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
  const prompt = `Ты бизнес-архитектор nx4Lab. Сгенерируй 8 IT-идей для: ${industries.join(', ')}. Отдел: ${dept}. Роль: ${role}. Контекст: ${context}.`;
  
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

  const result = await aiRequest(prompt, schema, 'flash', true);
  const ideas = safeJsonParse(result.text) || [];
  return ideas.map((i: any) => ({ ...i, sources: result.sources }));
};

export const deepDiveIdea = async (idea: Idea): Promise<any> => {
  const prompt = `Глубокий бизнес-аудит nx4Lab для: ${idea.title}. Опиши диагностику, смету и roadmap. Используй Google Search для данных 2024.`;
  const result = await aiRequest(prompt, { type: Type.OBJECT }, 'pro', true);
  const data = safeJsonParse(result.text) || {};
  return { ...data, groundingSources: result.sources };
};

export const expandIndustryNode = async (label: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разбей "${label}" на 5 процессов. Верни JSON массив объектов {label, type: 'process'}.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return safeJsonParse(response.text) || [];
  } catch (e) { return []; }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: `High-tech nx4Lab SaaS UI concept: ${prompt}. Minimalist, dark blue theme, 4k.` }] }
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

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const prompt = `Generate landing page content for nx4Lab project: ${idea.title}. Founder ${contacts.name}. Include headline, subheadline, benefits, features, cta, painPoints, founderStory.`;
  const result = await aiRequest(prompt, { type: Type.OBJECT }, 'flash', false);
  return safeJsonParse(result.text) || {};
};
