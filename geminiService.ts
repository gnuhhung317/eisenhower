import { GoogleGenAI, Type } from "@google/genai";
import { QuadrantType, Task, AIImportResult } from "../types";

// Helper to get client (using the requested initialization pattern)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseTasksFromText = async (inputText: string): Promise<AIImportResult[]> => {
  const ai = getAiClient();

  const prompt = `
    Analyze the following text which contains a list of tasks or meeting notes.
    Break it down into individual actionable tasks.
    For each task, estimate its Eisenhower Matrix quadrant based on urgency and importance:
    - Q1: Urgent & Important (Crises, deadlines)
    - Q2: Not Urgent & Important (Planning, growth, health)
    - Q3: Urgent & Not Important (Interruptions, some calls/emails)
    - Q4: Not Urgent & Not Important (Time wasters)
    
    If it's unclear, default to Q2 or Backlog.
    Extract relevant short tags (max 2) like "Work", "Home", "Finance".
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt}\n\nInput Text:\n${inputText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            quadrant: { 
              type: Type.STRING, 
              enum: [QuadrantType.Q1, QuadrantType.Q2, QuadrantType.Q3, QuadrantType.Q4, QuadrantType.Backlog] 
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "quadrant", "tags"],
        },
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) return [];
  
  try {
    return JSON.parse(jsonText) as AIImportResult[];
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

export const generateWeeklyReview = async (tasks: Task[]): Promise<string> => {
  const ai = getAiClient();

  const completedQ1 = tasks.filter(t => t.completed && t.quadrant === QuadrantType.Q1).length;
  const completedQ2 = tasks.filter(t => t.completed && t.quadrant === QuadrantType.Q2).length;
  const openQ1 = tasks.filter(t => !t.completed && t.quadrant === QuadrantType.Q1).length;
  const openBacklog = tasks.filter(t => !t.completed && t.quadrant === QuadrantType.Backlog).length;

  const summary = `
    Completed Q1: ${completedQ1}
    Completed Q2: ${completedQ2}
    Pending Q1: ${openQ1}
    Pending Backlog: ${openBacklog}
    Total Tasks: ${tasks.length}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      You are a productivity coach. Review this user's weekly performance based on their Eisenhower Matrix usage.
      Give a concise, encouraging, but analytical summary (max 3 sentences).
      Suggest one specific focus adjustment for next week.
      
      Data:
      ${summary}
    `,
  });

  return response.text || "Could not generate review.";
};