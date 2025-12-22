
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'imagen-4.0-generate-001';

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  const prompt = `Ты — элитный бизнес-архитектор. Используй Google Search, чтобы найти реальные новости, отчеты об убытках и технологические тренды 2024-2025 в отраслях: ${industries.join(', ')}.
  КОНТЕКСТ: Отдел: ${dept}. Роль пользователя: ${role}. Ситуация: ${context}. Стадия: ${stage}.
  ЗАДАЧА: Сгенерируй 8 идей IT-решений, основанных на реальных рыночных болях.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
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

    // Извлекаем ссылки из поиска для обоснования
    const groundings = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const ideas: Idea[] = JSON.parse(response.text || "[]");

    return ideas.map(idea => ({
      ...idea,
      // Добавляем источники в описание, если они есть
      description: idea.description + (groundings.length > 0 ? "\n\nОсновано на анализе рыночных данных." : "")
    }));
  } catch (e) {
    console.error("Ideas Generation Error:", e);
    return [];
  }
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
      model: MODEL_IMAGE,
      prompt: `High-tech minimalist 3D render of a software interface or business concept for: ${prompt}. Futuristic, corporate blue and slate gray palette, 4k, professional photography style, clean background.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    });
    const base64 = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64}`;
  } catch (e) {
    console.error("Image Gen Error:", e);
    return null;
  }
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  const prompt = `Проведи глубокий аудит проблемы: "${idea.problemStatement}". 
  Используй Google Search для поиска бенчмарков и стоимости аналогичных решений на рынке.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
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
  const prompt = `Создай контент для инвестиционного лендинга проекта "${idea.title}".
  Проблема: "${idea.problemStatement}". Основатель: ${contacts.name} из ${contacts.companyName}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
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
    return {
      headline: "Инвестиции в автоматизацию",
      subheadline: "Решение для " + idea.title,
      benefits: [], features: [], cta: "Начать", painPoints: [], founderStory: ""
    };
  }
};

export const expandIndustryNode = async (label: string): Promise<IndustryNode[]> => {
  const prompt = `Разбей отрасль или процесс "${label}" на 5 подпроцессов для автоматизации.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
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
