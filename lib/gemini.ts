import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const GEMINI_FALLBACK_CHAIN = [
  "gemini-3.1-flash-lite", // Priority 1: Workhorse (500 RPD quota, sub-second latency)
  "gemini-3.5-flash-lite", // Priority 2: High quota fallback (500 RPD)
  "gemini-2.5-flash",      // Priority 3: Complex reasoning (20 RPD)
  "gemini-3.8-flash",      // Priority 4: Advanced reasoning
];

export type ModalityCategory = "CONVERSATION" | "CODE" | "IMAGE" | "MUSIC" | "VIDEO";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type?: string;
}

export interface IntentClassification {
  category: ModalityCategory;
  extractedPrompt: string;
  duration?: number;
  confidence?: number;
  title?: string;
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

export function cleanHeuristicTitle(prompt: string): string {
  const cleaned = prompt
    .replace(/^(please\s+)?(can\s+you\s+)?(generate|create|make|compose|write|draw|paint|show\s+me|give\s+me|build)\s+(an?\s+)?/i, "")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 5).join(" ");
  if (!words) return "New Conversation";
  return (words.charAt(0).toUpperCase() + words.slice(1)).slice(0, 35);
}

/**
 * Priority 5: Rule-based Heuristic Classifier
 * Guaranteed 100% uptime with zero API calls, with follow-up awareness
 */
export function classifyWithHeuristics(
  prompt: string,
  history: ChatMessage[] = []
): IntentClassification {
  const text = prompt.toLowerCase().trim();
  const title = cleanHeuristicTitle(prompt);

  // Extract duration if specified (e.g., "15 seconds", "15-second", "20s", "30 sec")
  const durationMatch = text.match(/(\d+)\s*[-_]?\s*(?:seconds?|secs?|s)\b/i);
  let duration: number | undefined = undefined;
  if (durationMatch) {
    const parsed = parseInt(durationMatch[1], 10);
    duration = Math.min(Math.max(parsed, 5), 30);
  }

  // Follow-up detection if prompt refers to recent interaction
  const lastAssistantMessage =
    history.length > 0
      ? [...history].reverse().find((m) => m.role === "assistant")
      : undefined;

  const isFollowUp =
    /^(now\s+)?(make\s+it|change\s+it|add\s+|modify|convert|rewrite|update|animate\s+that|do\s+the\s+same|turn\s+it)\b/i.test(
      text
    ) || text.length < 25;

  if (isFollowUp && lastAssistantMessage) {
    if (lastAssistantMessage.type === "code") {
      return {
        category: "CODE",
        extractedPrompt: prompt,
        title,
        source: "heuristic",
      };
    }
    if (lastAssistantMessage.type === "image") {
      return {
        category: "IMAGE",
        extractedPrompt: `${lastAssistantMessage.content}, ${prompt}`,
        title,
        source: "heuristic",
      };
    }
    if (lastAssistantMessage.type === "audio") {
      return {
        category: "MUSIC",
        extractedPrompt: `${lastAssistantMessage.content}, ${prompt}`,
        title,
        duration: duration || 10,
        source: "heuristic",
      };
    }
    if (lastAssistantMessage.type === "video") {
      return {
        category: "VIDEO",
        extractedPrompt: `${lastAssistantMessage.content}, ${prompt}`,
        title,
        duration: duration || 4,
        source: "heuristic",
      };
    }
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
      title,
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
      title,
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
      title,
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
      title,
      source: "heuristic",
    };
  }

  // Default: Conversation
  return {
    category: "CONVERSATION",
    extractedPrompt: prompt,
    title,
    source: "heuristic",
  };
}

/**
 * Classifies prompt intent using the Gemini fallback chain with local heuristic safety net
 * and contextual prompt synthesis for follow-up edits.
 */
export async function classifyPromptIntent(
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<IntentClassification> {
  let contextSnippet = "";
  if (history && history.length > 0) {
    const recent = history.slice(-6);
    contextSnippet = `
Recent Conversation Context:
${recent
  .map(
    (m) =>
      `${m.role === "assistant" ? "Assistant" : "User"} (${m.type || "text"}): ${m.content.slice(0, 300)}`
  )
  .join("\n")}
`;
  }

  const classificationPrompt = `
You are the master intent classifier, prompt synthesizer, and conversation title generator for an omnimodal AI app (Genius.ai).
Analyze the user's latest prompt in the context of recent conversation history (if provided) and categorize it into EXACTLY ONE of these categories:
1. "CONVERSATION": General questions, reasoning, brainstorming, chats, explanations, follow-ups.
2. "CODE": Requests to write, debug, refactor, explain, or edit code/scripts/algorithms.
3. "IMAGE": Requests to create, draw, paint, generate, or modify an image/photo/picture.
4. "MUSIC": Requests to compose, make, generate, or adjust music, tracks, beats, or audio.
5. "VIDEO": Requests to make, generate, animate, or adjust a video or cinematic clip.

Context Awareness & Prompt Synthesis:
- If the user's latest prompt is a revision, modification, or follow-up to a previous item (e.g., "now make it blue", "speed up the tempo", "convert to python", "make it shorter", "animate that"):
  1. Determine the appropriate category based on context (e.g., modifying an image is IMAGE; modifying code is CODE; animating an image is VIDEO).
  2. For "extractedPrompt": Synthesize a complete, self-contained prompt combining the previous context with the new user instruction.
- If the prompt is standalone, extract the clean creative prompt without conversational filler words like "can you please generate for me".
- "duration": If the user specified a duration in seconds for music/video, extract it as an integer between 5 and 30 (default: 10).
- "title": A concise, natural, highly descriptive 2 to 5 word title for this conversation (e.g. "JWT Auth Flow", "Acoustic Jazz Piano", "Next.js Authentication", "E-commerce Revenue Table", "Quantum Computing Basics").
  - Never include conversational filler words like "Compose A", "Create A", "Write A", "Can You", "Hey Give Me".
  - Capitalize like a title (Title Case).
  - Maximum 35 characters.
${contextSnippet}
User Prompt: "${userPrompt}"

Return ONLY valid JSON in this exact structure without markdown or backticks:
{"category":"CONVERSATION"|"CODE"|"IMAGE"|"MUSIC"|"VIDEO","extractedPrompt":"string","title":"string","duration":10,"confidence":0.95}
`;

  try {
    const { result, modelUsed } = await runGeminiWithFallback(async (_modelName, model) => {
      const response = await model.generateContent(classificationPrompt);
      const text = response.response.text().trim();
      // Remove any accidental markdown backticks
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      // Explicit regex extraction check for duration if user specified one (e.g. "15-second", "15 seconds")
      const regexDuration = userPrompt.match(/(\d+)\s*[-_]?\s*(?:seconds?|secs?|s)\b/i);
      const parsedRegexDuration = regexDuration ? parseInt(regexDuration[1], 10) : undefined;
      const rawDuration = parsedRegexDuration !== undefined ? parsedRegexDuration : parsed.duration;
      const finalDuration = rawDuration ? Math.min(Math.max(rawDuration, 5), 30) : undefined;

      const cleanTitle = parsed.title
        ? String(parsed.title).replace(/["']/g, "").trim().slice(0, 40)
        : cleanHeuristicTitle(userPrompt);

      return {
        category: (parsed.category || "CONVERSATION").toUpperCase() as ModalityCategory,
        extractedPrompt: parsed.extractedPrompt || userPrompt,
        title: cleanTitle,
        duration: finalDuration,
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
    return classifyWithHeuristics(userPrompt, history);
  }
}

/**
 * Dedicated Gemini chat title generator for backfilling or updating conversation titles
 */
export async function generateChatTitle(prompt: string): Promise<string> {
  try {
    const titlePrompt = `
Generate a concise, natural, highly descriptive 2 to 5 word title (maximum 35 characters) for a chat conversation that begins with this user prompt:
"${prompt.slice(0, 300)}"

Rules:
- Never include filler words like "Compose A", "Create A", "Write A", "Can You", "Hey Give Me", "Generate".
- Capitalize like a title (Title Case).
- Return ONLY the title text with no quotes, punctuation, or markdown.
`;
    const { result } = await runGeminiWithFallback(async (_modelName, model) => {
      const response = await model.generateContent(titlePrompt);
      return response.response.text().trim().replace(/["']/g, "").slice(0, 35);
    });
    return result || cleanHeuristicTitle(prompt);
  } catch (error) {
    return cleanHeuristicTitle(prompt);
  }
}

/**
 * Builds alternating user/model turns for Gemini multi-turn generateContent({ contents })
 */
export function buildGeminiContentTurns(
  systemInstruction: string,
  history: ChatMessage[] = [],
  currentPrompt: string
) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  // Filter out any messages without text content
  const validHistory = (history || []).filter(
    (m) => m && typeof m.content === "string" && m.content.trim().length > 0
  );

  for (const msg of validHistory) {
    const role: "user" | "model" = msg.role === "assistant" ? "model" : "user";
    // Avoid consecutive messages with the same role by concatenating
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
    } else {
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  }

  // Gemini requires that history start with a "user" role
  if (contents.length > 0 && contents[0].role === "model") {
    contents.shift();
  }

  // Prepend system instruction to the very first user message
  if (contents.length > 0 && contents[0].role === "user") {
    contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
  }

  // Append current user prompt
  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents[contents.length - 1].parts[0].text += `\n\nUser: ${currentPrompt}`;
  } else if (contents.length > 0) {
    contents.push({
      role: "user",
      parts: [{ text: currentPrompt }],
    });
  } else {
    // No history: single turn with system instruction + prompt
    contents.push({
      role: "user",
      parts: [{ text: `${systemInstruction}User: ${currentPrompt}` }],
    });
  }

  return contents;
}

/**
 * Generate conversational response using Gemini fallback chain with full multi-turn memory
 */
export async function generateConversation(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ text: string; modelUsed: string }> {
  const systemInstruction =
    "You are Genius.ai, an advanced, friendly, and helpful AI assistant. Be concise, articulate, and accurate. When presenting tabular data, lists, or comparisons, format them cleanly using standard GitHub Flavored Markdown tables. When generating checklists or task lists, use markdown task format with empty unchecked boxes (- [ ]) by default so users can tick them off interactively, unless the user explicitly requests items to be pre-checked. When writing mathematical or scientific formulas, format them with LaTeX ($...$ for inline, $$...$$ for blocks). When generating workflows or architecture diagrams, use standard ```mermaid code blocks with double-quoted node labels (e.g. A[\"Step 1 (Details)\"] or B{\"Decision?\"}) and standard arrows with pipe labels (e.g. A -->|label| B) so punctuation parses cleanly. For key takeaways or notes, use blockquotes (> Note: ...). Never refer to yourself as Gemini or mention Google unless explicitly asked about underlying infrastructure.\n\n";

  const contents = buildGeminiContentTurns(systemInstruction, history, prompt);

  return await runGeminiWithFallback(async (_modelName, model) => {
    const response = await model.generateContent({ contents });
    return response.response.text();
  }).then(({ result, modelUsed }) => ({ text: result, modelUsed }));
}

/**
 * Generate code response using Gemini fallback chain with full multi-turn code memory
 */
export async function generateCode(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ text: string; modelUsed: string }> {
  const codingPromptPrefix =
    "You are Genius.ai Code Studio, an expert Senior Full-Stack Software Engineer. Provide clean, efficient, bug-free, and production-ready code with appropriate language markdown blocks (e.g. ```typescript, ```python, etc.). Include concise explanations for key design decisions and handle edge cases gracefully. Never refer to yourself as Gemini or mention Google.\n\n";

  const contents = buildGeminiContentTurns(codingPromptPrefix, history, prompt);

  return await runGeminiWithFallback(async (_modelName, model) => {
    const response = await model.generateContent({ contents });
    return response.response.text();
  }).then(({ result, modelUsed }) => ({ text: result, modelUsed }));
}
