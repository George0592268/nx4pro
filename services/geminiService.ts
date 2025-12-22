
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
const MODEL_TEXT_FLASH = 'gemini-3-flash-preview'; 
const MODEL_IMAGE = 'gemini-2.5-flash-image';

const safeJsonParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    let cleanText = text.trim();
    // Извлекаем JSON из markdown блоков, если они есть
    if (cleanText.includes("```")) {
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) cleanText = match[1].trim();
    }
    try {
      return JSON.parse(cleanText);
    } catch {
      // Попытка найти границы объекта/массива вручную
      const startArr = cleanText.indexOf('[');
      const endArr = cleanText.lastIndexOf(']');
      const startObj = cleanText.indexOf('{');
      const endObj = cleanText.lastIndexOf('}');
      let candidate = "";
      if (startArr !== -1 && endArr !== -1 && (startArr < startObj || startObj === -1)) {
        candidate = cleanText.substring(startArr, endArr + 1);
      } else if (startObj !== -1 && endObj !== -1) {
        candidate = cleanText.substring(startObj, endObj + 1);
      }
      if (candidate) return JSON.parse(candidate);
    }
    return null;
  } catch (e) {
    return null;
  }
};

async function aiRequest(prompt: string, schema: any, modelPrefer: 'pro' | 'flash' = 'flash', useSearch = true) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = modelPrefer === 'pro' ? MODEL_TEXT_PRO : MODEL_TEXT_FLASH;
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Всегда устанавливаем responseSchema, если она передана
  const config: any = {
    responseMimeType: "application/json",
    responseSchema: schema
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const russianSystemInstruction = "Ты — экспертный бизнес-аналитик IdeaForge. ПИШИ СТРОГО НА РУССКОМ ЯЗЫКЕ. Английские слова ЗАПРЕЩЕНЫ (кроме IT, AI, ROI, KPI).";
  const enhancedPrompt = `${russianSystemInstruction}\n\n${prompt}\n\nОТВЕТЬ СТРОГО В ФОРМАТЕ JSON СОГЛАСНО СТРУКТУРЕ.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: enhancedPrompt,
      config: config
    });
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e: any) {
    console.error("AI Request Error:", e);
    // Фоллбек на Flash без поиска, если возникла ошибка с инструментами
    const fallback = await ai.models.generateContent({
      model: MODEL_TEXT_FLASH,
      contents: `${russianSystemInstruction}\n\n${prompt}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return { text: fallback.text, sources: [] };
  }
}

const deepDiveSchema = {
  type: Type.OBJECT,
  properties: {
    diagnostic: {
      type: Type.OBJECT,
      properties: {
        groups: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              problems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    rootCause: { type: Type.STRING },
                    metrics: {
                      type: Type.OBJECT,
                      properties: { financialLoss: { type: Type.STRING } },
                      required: ["financialLoss"]
                    }
                  },
                  required: ["issue", "rootCause", "metrics"]
                }
              }
            },
            required: ["id", "title", "problems"]
          }
        }
      },
      required: ["groups"]
    },
    microIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          priority: { type: Type.STRING },
          description: { type: Type.STRING },
          hours: { type: Type.INTEGER },
          cost: { type: Type.STRING }
        },
        required: ["id", "title", "priority", "description", "hours", "cost"]
      }
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phase: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["phase", "duration", "description", "tasks"]
      }
    },
    investorProposal: {
      type: Type.OBJECT,
      properties: {
        pitch: { type: Type.STRING },
        investorBenefit: { type: Type.STRING },
        initiatorBenefit: { type: Type.STRING },
        financialHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        smartContractTerms: { type: Type.STRING }
      },
      required: ["pitch", "investorBenefit", "initiatorBenefit", "financialHighlights", "smartContractTerms"]
    },
    searchQueries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING },
          volume: { type: Type.INTEGER },
          cpc: { type: Type.NUMBER },
          competition: { type: Type.STRING }
        },
        required: ["query", "volume", "cpc", "competition"]
      }
    }
  },
  required: ["diagnostic", "microIdeas", "roadmap", "investorProposal", "searchQueries"]
};

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  const prompt = `IdeaForge Intel. Сгенерируй 8 IT-идей для отраслей: ${industries.join(', ')}. Роль пользователя: ${role}. Контекст бизнеса: ${context}.
  Для каждой идеи заполни id, title, problemStatement, rootCauses (массив строк), description, department, roiEstimate, targetRole, priorityScore. ПИШИ НА РУССКОМ.`;
  
  const schema = { 
    type: Type.ARRAY, 
    items: { 
      type: Type.OBJECT, 
      properties: { 
        id: { type: Type.STRING }, 
        title: { type: Type.STRING }, 
        problemStatement: { type: Type.STRING }, 
        rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        description: { type: Type.STRING }, 
        department: { type: Type.STRING }, 
        roiEstimate: { type: Type.STRING }, 
        targetRole: { type: Type.STRING }, 
        priorityScore: { type: Type.INTEGER } 
      }, 
      required: ["id", "title", "problemStatement", "rootCauses", "description", "department", "roiEstimate", "targetRole", "priorityScore"] 
    } 
  };
  const result = await aiRequest(prompt, schema, 'flash', true);
  const parsed = safeJsonParse(result.text);
  return (Array.isArray(parsed) ? parsed : []).map((i: any) => ({ ...i, groundingSources: result.sources }));
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  const prompt = `ПРОВЕДИ ПОЛНЫЙ ГЛУБОКИЙ АНАЛИЗ IT-ИДЕИ: "${idea.title}". 
  Описание: ${idea.description}.
  ТЫ ДОЛЖЕН СГЕНЕРИРОВАТЬ ВСЕ ПОЛЯ БЕЗ ИСКЛЮЧЕНИЯ:
  1. diagnostic: детальные группы проблем и финансовые потери.
  2. microIdeas: конкретные модули решения с оценкой часов (hours) и стоимости (cost).
  3. roadmap: 4 этапа внедрения с задачами.
  4. investorProposal: детальный питч, выгоды и финансовые показатели.
  5. searchQueries: реальные поисковые запросы, которые делают потенциальные клиенты.
  
  ПИШИ ВСЁ СТРОГО НА РУССКОМ. СТРОГО СОБЛЮДАЙ СТРУКТУРУ JSON.`;
  const result = await aiRequest(prompt, deepDiveSchema, 'pro', true);
  const parsed = safeJsonParse(result.text);
  return parsed ? { ...parsed, groundingSources: result.sources } : {};
};

const landingSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    subheadline: { type: Type.STRING },
    benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
    features: { type: Type.ARRAY, items: { type: Type.STRING } },
    cta: { type: Type.STRING },
    painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    founderStory: { type: Type.STRING }
  },
  required: ["headline", "subheadline", "benefits", "features", "cta", "painPoints", "founderStory"]
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const prompt = `Создай лендинг для идеи: ${idea.title}. Основатель: ${contacts.name}. ПИШИ НА РУССКОМ. Используй стиль Apple (минимализм, фокус на ценности).`;
  const result = await aiRequest(prompt, landingSchema, 'flash', false);
  return safeJsonParse(result.text) || {
    headline: idea.title,
    subheadline: idea.description,
    benefits: [],
    features: [],
    cta: "Связаться",
    painPoints: [],
    founderStory: ""
  };
};

export const expandIndustryNode = async (label: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разложи бизнес-отрасль или процесс "${label}" на 5 под-процессов. ПИШИ НА РУССКОМ. Верни JSON массив [{label, type: 'process'}].`;
  try {
    const response = await ai.models.generateContent({ 
      model: MODEL_TEXT_FLASH, 
      contents: prompt, 
      config: { responseMimeType: "application/json" } 
    });
    return safeJsonParse(response.text) || [];
  } catch (e) {
    return [];
  }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: MODEL_IMAGE, 
      contents: { parts: [{ text: `Professional SaaS dashboard UI design, minimalist, high-end Apple style, 4k resolution: ${prompt}` }] } 
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (e) { return null; }
};
