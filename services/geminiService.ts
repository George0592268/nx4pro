import { GoogleGenAI, Type } from "@google/genai";
import { Idea, LandingPageContent, IndustryNode, ContactInfo } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Используем модель gemini-2.0-flash-exp (бесплатная в тестовый период)
const modelName = 'gemini-2.0-flash-exp';

const cleanJson = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = Math.min(
    cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity,
    cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity
  );
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (start === Infinity || end === -1) return cleaned;
  return cleaned.substring(start, end + 1);
};

export const generateIdeasForIndustries = async (
  industries: string[], 
  dept: string, 
  context: string, 
  stage: string, 
  role: string
): Promise<Idea[]> => {
  const prompt = `Ты — элитный бизнес-архитектор. Твоя задача — найти скрытые системные боли бизнеса.
  
  КОНТЕКСТ:
  - Отрасли: ${industries.join(', ')}
  - Целевой отдел: ${dept}
  - Роль пользователя: ${role}
  - Описание ситуации: ${context}
  - Стадия компании: ${stage}

  ЗАДАЧА: Сгенерируй 8 идей IT-решений.
  ДЛЯ КАЖДОЙ ИДЕИ ВЕРНИ JSON:
  - id: уникальный ID
  - problemStatement: Острая боль (напр: "Потеря 15% прибыли на логистическом плече")
  - rootCauses: [3 ПЕРВОПРИЧИНЫ, почему это происходит — пиши то, что собственник боится признать, но это правда]
  - title: Название IT-решения
  - description: Краткое описание
  - department: ${dept}
  - roiEstimate: Ожидаемый ROI
  - targetRole: ${role}
  - priorityScore: 1-100

  Верни ТОЛЬКО массив JSON на РУССКОМ языке.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.7 
      }
    });
    const ideas = JSON.parse(cleanJson(response.text || "[]"));
    return ideas.map((i: any) => ({ 
      ...i, 
      id: i.id || Math.random().toString(36).substr(2, 9),
      department: dept,
      targetRole: role,
      industryId: industries[0] || 'general'
    }));
  } catch (e) {
    console.error("Ideas Generation Error:", e);
    return [];
  }
};

export const deepDiveIdea = async (idea: Idea): Promise<Partial<Idea>> => {
  const prompt = `Проведи полный аудит боли: "${idea.problemStatement}".
  Первопричины: ${idea.rootCauses?.join(', ')}.
  Роль: ${idea.targetRole}, Отдел: ${idea.department}.

  СГЕНЕРИРУЙ JSON НА РУССКОМ:
  1. diagnostic: { groups: [{ id, title, problems: [{ issue, rootCause, metrics: { financialLoss } }] }] }
     - В rootCause пиши глубинные системные ошибки.
  2. microIdeas: [{ id, title, priority, description, hours, cost }]
  3. roadmap: [{ phase, duration, description, tasks: [] }]
  4. investorProposal: { pitch, investorBenefit, initiatorBenefit, smartContractTerms }
     - initiatorBenefit: Как собственник снижает операционную нагрузку за счет внешних инвестиций через ForgeProtocol.
     - smartContractTerms: Описание сделки в блокчейне (Escrow, DAO).
  5. searchQueries: [{ query, volume, cpc, competition }]
  
  Пиши экспертно, жестко и по делу.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (e) {
    console.error("Deep Dive Error:", e);
    return {};
  }
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo): Promise<LandingPageContent> => {
  const prompt = `Создай контент для инвестиционной страницы проекта "${idea.title}".
  Проблема: "${idea.problemStatement}". 
  Собственник: ${contacts.name} (${contacts.companyName}).
  
  Акцент: ForgeProtocol. Собственник дает бизнес-полигон, Инвестор - капитал. 
  Верни JSON: { headline, subheadline, benefits: [], features: [], cta, painPoints: [], founderStory }.`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (e) {
    return {
      headline: "Инвестируйте в проверенный бизнес",
      subheadline: "Автоматизация реального сектора через ForgeProtocol",
      benefits: [], features: [], cta: "Связаться", painPoints: [], founderStory: ""
    };
  }
};

export const expandIndustryNode = async (label: string): Promise<IndustryNode[]> => {
  const prompt = `Разбей "${label}" на 5 детальных процессов на РУССКОМ. JSON массив {id, label, type: 'process'}.`;
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || "[]"));
  } catch (e) { return []; }
};