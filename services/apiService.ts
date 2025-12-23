
import { Idea, LandingPageContent, ContactInfo } from "../types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const getApiKey = () => process.env.API_KEY || "";

const safeJsonParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    let cleanText = text.trim();
    if (cleanText.includes("```")) {
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) cleanText = match[1].trim();
    }
    return JSON.parse(cleanText);
  } catch (e) { 
    console.error("JSON Parse Error:", e, text);
    return null; 
  }
};

export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${getApiKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2-flash:free",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1
      })
    });
    return response.ok;
  } catch (e) { return false; }
};

async function openRouterRequest(prompt: string, modelId: string) {
  const apiKey = getApiKey();
  
  const systemPrompt = `Ты — ведущий бизнес-аналитик IdeaForge. 
Твоя задача: генерировать высокоточные IT-стратегии. 
Отвечай СТРОГО на русском языке. 
Ответ должен быть ТОЛЬКО в формате JSON, без лишних слов.`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "IdeaForge"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "API Error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    return { text: content };
  } catch (e) {
    console.error("OpenRouter Request Failed:", e);
    throw e;
  }
}

export const transcribeAudio = async (base64Data: string, mimeType: string, modelId: string): Promise<string> => {
  if (!modelId.includes('gemini')) {
    return "Модель Xiaomi MiMo не поддерживает голос. Переключитесь на Gemini в настройках ИИ.";
  }
  return "Функция аудио будет доступна в финальной версии. Сейчас используйте текстовое описание.";
};

export const generateIdeasForIndustries = async (industries: string[], context: string, role: string, modelId: string): Promise<Idea[]> => {
  const prompt = `Сгенерируй 8 IT-продуктов для: ${industries.join(', ')}. Контекст: ${context}. Роль: ${role}. 
Верни JSON массив объектов в поле "ideas": 
{ "ideas": [ { "id": "1", "title": "Название", "problemStatement": "Проблема", "rootCauses": ["Причина"], "description": "Решение", "department": "Отдел", "roiEstimate": "Прогноз", "targetRole": "Роль", "priorityScore": 80 } ] }`;
  
  const result = await openRouterRequest(prompt, modelId);
  const parsed = safeJsonParse(result.text);
  return Array.isArray(parsed?.ideas) ? parsed.ideas : [];
};

export const deepDiveIdea = async (idea: Idea, modelId: string): Promise<Partial<Idea>> => {
  const prompt = `Выполни аудит идеи: "${idea.title}". 
Верни JSON с полями: diagnostic, microIdeas, roadmap, investorProposal, searchQueries. 
Все тексты на русском. Формат JSON.`;
  
  const result = await openRouterRequest(prompt, modelId);
  return safeJsonParse(result.text) || {};
};

export const generateLandingContent = async (idea: Idea, contacts: ContactInfo, modelId: string): Promise<LandingPageContent> => {
  const prompt = `Контент для лендинга: ${idea.title}. Основатель: ${contacts.name}. 
Верни JSON: headline, subheadline, benefits[], features[], cta, painPoints[], founderStory.`;
  
  const result = await openRouterRequest(prompt, modelId);
  return safeJsonParse(result.text) || { 
    headline: idea.title, 
    subheadline: idea.description, 
    benefits: [], features: [], cta: "Контакт", painPoints: [], founderStory: "" 
  };
};

export const expandIndustryNode = async (label: string, modelId: string): Promise<any[]> => {
  const prompt = `Процессы для сферы: "${label}". Верни JSON массив объектов {label, type: 'process'}.`;
  const result = await openRouterRequest(prompt, modelId);
  const parsed = safeJsonParse(result.text);
  return Array.isArray(parsed) ? parsed : [];
};

export const generateProjectImage = async (prompt: string): Promise<string | null> => {
  return null; 
};
