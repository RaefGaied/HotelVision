import { GoogleGenerativeAI } from "@google/generative-ai";

const modelName = "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePostIdeas = async ({ topic, tone, audience }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing from environment variables");
  }

  const prompt = `Tu es un assistant de community management. Génère 3 idées de publication.
    Contrainte:
    - Sujet: ${topic}
    - Ton: ${tone}
    - Audience: ${audience}
    Réponds STRICTEMENT dans ce JSON:
    {
      "ideas": [
        {
          "title": "",
          "summary": "",
          "cta": "",
          "hashtags": []
        }
      ]
    }
    `;

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() ?? result?.response?.text ?? "";

  try {
    const parsed = JSON.parse(text);
    return parsed?.ideas?.slice(0, 3) ?? [];
  } catch (error) {
    // fallback: split plain text
    return text
      .split(/\n\n+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((chunk, index) => ({
        title: `Idée ${index + 1}`,
        summary: chunk.trim(),
        cta: "Engagez votre communauté",
        hashtags: [],
      }));
  }
};

export const analyzeSentiment = async ({ text, context }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing from environment variables");
  }

  const prompt = `Analyse le sentiment du texte suivant et réponds STRICTEMENT en JSON.
    Texte: """${text}"""
    Contexte: ${context || "non fourni"}

    JSON attendu:
    {
      "sentiment": "positif|neutre|negatif",
      "score": 0-1,
      "summary": "",
      "recommendations": ["", ""]
    }`;

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const responseText = result?.response?.text?.() ?? result?.response?.text ?? "";

  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    return {
      sentiment: "neutre",
      score: 0.5,
      summary: responseText.trim() || "Analyse indisponible",
      recommendations: [],
    };
  }
};

export const chatWithAI = async ({ messages, userId, chatId }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing from environment variables");
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Format messages for the AI model
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9,
        topP: 0.1,
        topK: 16,
      },
    });

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    
    // Generate response
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      data: {
        response: text,
        chatId: chatId || `chat-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error("Chat with AI error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la génération de la réponse.",
      details: error.message
    };
  }
};
