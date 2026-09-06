import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const GEMINI_FALLBACK_CHAIN = [
  "gemini-3.8-flash",      // Priority 1: Smartest reasoning
  "gemini-2.5-flash",      // Priority 2: Reliable fallback
  "gemini-3.1-flash-lite", // Priority 3: Workhorse (500 RPD quota)
  "gemini-3.5-flash-lite", // Priority 4: Safety net (500 RPD quota)
];

export type ModalityCategory = "CONVERSATION" | "CODE" | "IMAGE" | "MUSIC" | "VIDEO";

export interface IntentClassification {
  category: ModalityCategory;
  extractedPrompt: string;
  duration?: number;
  confidence?: number;
  source: "gemini" | "heuristic";
  modelUsed?: string;
}

/**
 * Executes an operation with automatic fallback through the Gemini model chain
 */
export async function runGeminiWithFallback<T>(
  taskFn: (modelName: string, model: any) => Promise<T>
): Promise<{ result: T; modelUsed: string }> {
  let lastError: any = null;

  for (const modelName of GEMINI_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await taskFn(modelName, model);
      return { result, modelUsed: modelName };
    } catch (error: any) {
      console.warn(
        `[Gemini Engine] Model "${modelName}" encountered an issue: ${error?.message || error}. Trying next fallback...`
      );
      lastError = error;
    }
  }

  throw new Error(
    `All Gemini fallback models failed. Last error: ${lastError?.message || lastError}`
  );
}

/**
 * Priority 5: Rule-based Heuristic Classifier
 * Guaranteed 100% uptime with zero API calls
 */
export function classifyWithHeuristics(prompt: string): IntentClassification {
  const text = prompt.toLowerCase().trim();

  // Extract duration if specified (e.g., "15 seconds", "15-second", "20s", "30 sec")
  const durationMatch = text.match(/(\d+)\s*[-_]?\s*(?:seconds?|secs?|s)\b/i);
  let duration: number | undefined = undefined;
  if (durationMatch) {
    const parsed = parseInt(durationMatch[1], 10);
    duration = Math.min(Math.max(parsed, 5), 30);
  }

  // Video Patterns
  if (
    /\b(generate video|create video|make a video|video of|animate|animation of|cinematic clip|film of|motion of)\b/i.test(
      text
    )
  ) {
    const cleanPrompt = prompt
      .replace(/^(please\s+)?(generate|create|make)\s+(a\s+)?(video|clip|animation)\s+(of|about|showing)?/i, "")
      .trim();
    return {
      category: "VIDEO",
      extractedPrompt: cleanPrompt || prompt,
      source: "heuristic",
    };
  }

  // Music Patterns
  if (
    /\b(compose|music|song|track|melody|beat|audio track|soundtrack|lo-fi|synthwave|acoustic guitar beat|instrumental)\b/i.test(
      text
    )
  ) {
    const cleanPrompt = prompt
      .replace(/^(please\s+)?(generate|create|make|compose)\s+(a\s+)?(music|song|track|melody|beat|audio)\s+(of|for|about|with)?/i, "")
      .trim();
    return {
      category: "MUSIC",
      extractedPrompt: cleanPrompt || prompt,
      duration: duration || 10,
      source: "heuristic",
    };
  }

  // Image Patterns
  if (
    /\b(draw|paint|picture of|photo of|photograph of|image of|portrait of|illustration of|render of|visualize)\b/i.test(
      text
    ) ||
    /^(generate|create|make)\s+(an?\s+)?(image|photo|picture|photograph)/i.test(text)
  ) {
    const cleanPrompt = prompt
      .replace(/^(please\s+)?(draw|paint|generate|create|make)\s+(an?\s+)?(image|photo|picture|photograph|portrait|illustration)?\s*(of|showing|depicting)?/i, "")
      .trim();
    return {
      category: "IMAGE",
      extractedPrompt: cleanPrompt || prompt,
      source: "heuristic",
    };
  }

  // Code Patterns
  if (
    /\b(code|function|script|write a program|debug|typescript|javascript|python|react hook|sql query|css style|algorithm|api endpoint)\b/i.test(
      text
    ) ||
    /^(write|create|implement)\s+(a\s+)?(function|class|component|hook|script|query)/i.test(text)
  ) {
    return {
      category: "CODE",
      extractedPrompt: prompt,
      source: "heuristic",
    };
  }

  // Default: Conversation
  return {
    category: "CONVERSATION",
    extractedPrompt: prompt,
    source: "heuristic",
  };
}

/**
 * Classifies prompt intent using the Gemini fallback chain with local heuristic safety net
 */
export async function classifyPromptIntent(userPrompt: string): Promise<IntentClassification> {
  const classificationPrompt = `
You are the master intent classifier for an omnimodal AI app (Genius.ai).
Analyze the user's prompt and categorize it into EXACTLY ONE of these categories:
1. "CONVERSATION": General questions, reasoning, brainstorming, chats, explanations.
2. "CODE": Requests to write, debug, refactor, or explain code/scripts/algorithms.
3. "IMAGE": Requests to create, draw, paint, or generate a picture/photo/image.
4. "MUSIC": Requests to compose, make, or generate music, tracks, beats, or audio.
5. "VIDEO": Requests to make, generate, or animate a video or cinematic clip.

Also extract:
- "extractedPrompt": The clean, optimized creative prompt without filler words like "can you please generate for me".
- "duration": If the user specified a duration in seconds for music/video, extract it as an integer between 5 and 30 (default: 10).

User Prompt: "${userPrompt}"

Return ONLY valid JSON in this exact structure without markdown or backticks:
{"category":"CONVERSATION"|"CODE"|"IMAGE"|"MUSIC"|"VIDEO","extractedPrompt":"string","duration":10,"confidence":0.95}
`;

  try {
    const { result, modelUsed } = await runGeminiWithFallback(async (_modelName, model) => {
      const response = await model.generateContent(classificationPrompt);
      const text = response.response.text().trim();
      // Remove any accidental markdown backticks
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);
      return {
        category: (parsed.category || "CONVERSATION").toUpperCase() as ModalityCategory,
        extractedPrompt: parsed.extractedPrompt || userPrompt,
        duration: parsed.duration ? Math.min(Math.max(parsed.duration, 5), 30) : undefined,
        confidence: parsed.confidence || 0.9,
      };
    });

    return {
      ...result,
      source: "gemini",
      modelUsed,
    };
  } catch (error) {
    console.warn("[Gemini Classifier] Fallback chain failed. Using Heuristic rules:", error);
    return classifyWithHeuristics(userPrompt);
  }
}

/**
 * Generate conversational response using Gemini fallback chain
 */
export async function generateConversation(
  promptOrMessages: string | any[]
): Promise<{ text: string; modelUsed: string }> {
  return await runGeminiWithFallback(async (_modelName, model) => {
    const content = typeof promptOrMessages === "string" ? promptOrMessages : promptOrMessages;
    const response = await model.generateContent(content);
    return response.response.text();
  }).then(({ result, modelUsed }) => ({ text: result, modelUsed }));
}

/**
 * Generate code response using Gemini fallback chain
 */
export async function generateCode(
  promptOrMessages: string | any[]
): Promise<{ text: string; modelUsed: string }> {
  const codingPromptPrefix =
    "You are an expert Senior Full-Stack Software Engineer. Provide clean, efficient, bug-free, and production-ready code with appropriate language markdown blocks (e.g. ```typescript, ```python, etc.). Include concise explanations for key design decisions and handle edge cases gracefully.\n\nTask: ";

  return await runGeminiWithFallback(async (_modelName, model) => {
    const content =
      typeof promptOrMessages === "string"
        ? `${codingPromptPrefix}${promptOrMessages}`
        : promptOrMessages;
    const response = await model.generateContent(content);
    return response.response.text();
  }).then(({ result, modelUsed }) => ({ text: result, modelUsed }));
}
