import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash-latest";

export const searchCryptoNews = async (topic: string): Promise<NewsItem[]> => {
  try {
    const prompt = `
      Search for the latest real-time news, twitter/x discussions, and macro events affecting: "${topic}".
      Focus on the last 24-48 hours.
      
      Return the response in a structured JSON array format (do not use markdown code blocks, just raw JSON).
      Each item should be an object with:
      - title: Brief headline
      - summary: 2-3 sentence summary of the event
      - source: The origin (e.g., "CoinDesk", "Twitter/X @user", "CNBC")
      - url: A link if available (or a placeholder if not found)
      - sentiment: "BULLISH", "BEARISH", or "NEUTRAL"
      - timestamp: A readable time string (e.g. "2h ago")
      
      Provide at least 4 distinct items.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Parse JSON
    const data = JSON.parse(text);
    
    // Map to NewsItem with fallback IDs
    return data.map((item: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: item.title || "Unknown Title",
      summary: item.summary || "No summary available.",
      source: item.source || "Web",
      url: item.url || "#",
      sentiment: item.sentiment || "NEUTRAL",
      timestamp: item.timestamp || "Just now"
    }));

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Return mock data on failure to degrade gracefully
    return [
      {
        id: "err-1",
        title: "AI Analysis Unavailable",
        summary: "We couldn't connect to the intelligence network at this moment. Please try again.",
        source: "System",
        url: "#",
        sentiment: "NEUTRAL",
        timestamp: "Now"
      }
    ];
  }
};

export const analyzeArchitecture = async (query: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a Senior Blockchain Architect. Answer the following question about app development best practices deeply and technically: "${query}". Format with Markdown.`,
    });
    return response.text || "No analysis generated.";
  } catch (e) {
    console.error(e);
    return "Unable to generate architectural analysis.";
  }
}
