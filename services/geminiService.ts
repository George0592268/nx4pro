
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

// Модели согласно гайдлайнам
const MODEL_TEXT_COMPLEX = 'gemini-3-pro-preview';
const MODEL_TEXT_BASIC = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  console.log("Starting Ideas Generation for:", industries);
  
  // Создаем экземпляр непосредственно перед вызовом
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Ты — элитный бизнес-архитектор. Используй Google Search для поиска реальных проблем бизнеса 2024-2025.
  ОТРАСЛИ: ${industries.join(', ')}. ОТДЕЛ: ${dept}. РОЛЬ: ${role}. СИТУАЦИЯ: ${context}. СТАДИЯ: ${stage}.
  ЗАДАЧА: Сгенерируй 8 идей IT-решений (SaaS/AI/Automation). Каждое решение должно бить в конкретный финансовый убыток.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_COMPLEX,
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              problemStatement: { type: Type.STRING, description: "Четкая бизнес-боль" },
              rootCauses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 причины боли" },
              title: { type: Type.STRING, description: "Название IT-продукта" },
              description: { type: Type.STRING },
              department: { type: Type.STRING },
              roiEstimate: { type: Type.STRING },
              targetRole: { type: Type.STRING },
              priorityScore: { type: Type.INTEGER, description: "Уровень критичности 1-100" }
            },
            required: ["id", "problemStatement", "rootCauses", "title", "description", "department", "roiEstimate", "targetRole", "priorityScore"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.warn("Empty response from AI");
      return [];
    }
    
    return JSON.parse(text);
  } catch (e) {
    console.error("CRITICAL ERROR in generateIdeasForIndustries:", e);
    return [];
  }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  console.log("Generating Image for:", prompt);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          { text: `High-quality 3D render of a futuristic software interface concept for: ${prompt}. Professional, corporate aesthetic, blue and gray tones, 4k, clean background.` }
        ]
      }
    });

    // Ищем часть с данными изображения в ответе nano banana моделей
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Generation Error:", e);
    return null;
  }
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  console.log("Deep Diving into:", idea.title);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Проведи полный аудит проблемы: "${idea.problemStatement}". 
  Используй Google Search для поиска бенчмарков и конкурентов. Создай план реализации.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_COMPLEX,
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
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
                smartContractTerms: { type: Type.STRING }
              },
              required: ["pitch", "investorBenefit", "initiatorBenefit", "smartContractTerms"]
            },
            searchQueries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  query: { type: Type.STRING },
                  volume: { type: Type.INTEGER }
                },
                required: ["query", "volume"]
              }
            }
          },
          required: ["diagnostic", "microIdeas", "roadmap", "investorProposal", "searchQueries"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Deep Dive Error:", e);
    return {};
  }
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Создай контент для лендинга проекта "${idea.title}". Основатель: ${contacts.name} из ${contacts.companyName}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_BASIC,
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Landing Content Error:", e);
    return {
      headline: "Ошибка генерации",
      subheadline: "Попробуйте обновить страницу",
      benefits: [], features: [], cta: "Назад", painPoints: [], founderStory: ""
    };
  }
};

export const expandIndustryNode = async (label: string): Promise<IndustryNode[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Разбей отрасль или процесс "${label}" на 5 подпроцессов для автоматизации.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_BASIC,
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["id", "label", "type"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};
