// src/lib/ai.ts
const BRAINDUMP_PROMPT = `You are a productivity assistant that classifies tasks into an Eisenhower Matrix.

INPUT: The user will paste unstructured text — a messy brain dump of tasks, goals, worries, deadlines, and random thoughts.

YOUR JOB:
1. Extract each distinct task or actionable item from the text
2. Classify each into exactly one quadrant:
   - "do_now": Urgent AND Important. Deadlines within 1-2 days, critical obligations, things with consequences if missed.
   - "schedule": Important but NOT Urgent. Long-term goals, skill building, career prep, health habits. Things that matter but have no immediate deadline.
   - "delegate": Urgent but NOT Important. Minor deadlines, busywork someone else could handle, low-stakes obligations.
   - "drop": Neither Urgent nor Important. Time-wasters, distractions, things the user should stop doing.
3. Assign an optional category tag when obvious (academics, career, health, personal, extracurricular)
4. Add a brief note only when it adds useful context (deadline, reason for urgency, etc.)

OUTPUT FORMAT: Respond with ONLY a valid JSON object. No markdown backticks. No explanation. No preamble. No trailing text. Just the raw JSON.

{
  "nodes": [
    {
      "id": "bd_1",
      "label": "Short task name in 2-6 words",
      "quadrant": "do_now",
      "note": "Optional one-line context or null",
      "category": "Optional category or null"
    }
  ]
}

RULES:
- Maximum 10 nodes per dump. If the user lists more, keep the 10 most distinct items.
- Labels must be 2-6 words, action-oriented (start with a verb when possible)
- IDs must be "bd_1", "bd_2", "bd_3" etc. Always use the "bd_" prefix.
- Every node MUST have id, label, and quadrant. note and category can be null.
- quadrant MUST be exactly one of: "do_now", "schedule", "delegate", "drop"
- If input is empty, nonsensical, or not task-related, return {"nodes": []}
- Do NOT invent tasks the user didn't mention
- Do NOT return anything except the JSON object`;

const YOUTUBE_PROMPT = `You are a productivity assistant that extracts actionable steps from video transcripts.

INPUT: A transcript from a YouTube video (educational, tutorial, or informational).

YOUR JOB:
1. Read through the transcript carefully
2. Extract concrete, actionable steps or key learning milestones
3. Order them logically (the sequence they should be done in, not necessarily the order mentioned)
4. Write each step as a short verb-phrase (something the user can DO)

OUTPUT FORMAT: Respond with ONLY a valid JSON object. No markdown backticks. No explanation. No preamble. Just the raw JSON.

{
  "title": "Short video summary in 3-8 words",
  "source_url": "THE_ORIGINAL_URL",
  "steps": [
    {
      "id": "yt_1",
      "label": "Action step in 3-8 words",
      "order": 1,
      "detail": "Optional one-line elaboration or null"
    }
  ]
}

RULES:
- Maximum 12 steps. Focus on the most important actionable items.
- Labels must be verb phrases: "Install Node.js", not "Node.js installation"
- IDs must be "yt_1", "yt_2", "yt_3" etc. Always use the "yt_" prefix.
- Every step MUST have id, label, and order. detail can be null.
- If the transcript is empty or not useful, return {"title": "Unknown", "source_url": "", "steps": []}
- Do NOT return anything except the JSON object`;

function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.trim();
  return cleaned;
}

const VALID_QUADRANTS = ["do_now", "schedule", "delegate", "drop"];

interface BrainDumpNode {
  id: string;
  label: string;
  quadrant: string;
  note: string | null;
  category: string | null;
}

interface BrainDumpResponse {
  nodes: BrainDumpNode[];
}

interface YouTubeStep {
  id: string;
  label: string;
  order: number;
  detail: string | null;
}

interface YouTubeResponse {
  title: string;
  source_url: string;
  steps: YouTubeStep[];
}

function validateBrainDumpResponse(data: any): BrainDumpResponse {
  if (!data || !data.nodes || !Array.isArray(data.nodes)) {
    return { nodes: [] };
  }

  const validated: BrainDumpNode[] = data.nodes
    .filter((n: any) => {
      return (
        n &&
        typeof n.label === "string" &&
        n.label.trim().length > 0 &&
        typeof n.quadrant === "string" &&
        VALID_QUADRANTS.includes(n.quadrant)
      );
    })
    .slice(0, 10)
    .map((n: any, index: number) => ({
      id: typeof n.id === "string" ? n.id : `bd_${index + 1}`,
      label: String(n.label).trim().slice(0, 60),
      quadrant: n.quadrant,
      note: n.note && typeof n.note === "string" ? n.note.slice(0, 120) : null,
      category:
        n.category && typeof n.category === "string"
          ? n.category.slice(0, 30)
          : null,
    }));

  return { nodes: validated };
}

function validateYouTubeResponse(
  data: any,
  originalUrl: string,
): YouTubeResponse {
  if (!data || !data.steps || !Array.isArray(data.steps)) {
    return { title: "Unknown", source_url: originalUrl, steps: [] };
  }

  const validated: YouTubeStep[] = data.steps
    .filter((s: any) => {
      return s && typeof s.label === "string" && s.label.trim().length > 0;
    })
    .slice(0, 12)
    .map((s: any, index: number) => ({
      id: typeof s.id === "string" ? s.id : `yt_${index + 1}`,
      label: String(s.label).trim().slice(0, 80),
      order: typeof s.order === "number" ? s.order : index + 1,
      detail:
        s.detail && typeof s.detail === "string"
          ? s.detail.slice(0, 150)
          : null,
    }));

  return {
    title:
      typeof data.title === "string" ? data.title.slice(0, 100) : "Unknown",
    source_url: originalUrl,
    steps: validated,
  };
}

// ─── Gemini API (Primary) ───────────────────────────────────────
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(
  systemPrompt: string,
  userText: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const combinedPrompt = `${systemPrompt}\n\n---\n\nUser input:\n${userText}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ─── Claude API (Backup — disabled, no key) ────────────────────
async function callClaude(
  systemPrompt: string,
  userText: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Claude");
  return text;
}

// ─── Main Exported Functions ────────────────────────────────────
export async function classifyBrainDump(
  text: string,
): Promise<BrainDumpResponse> {
  let raw: string;

  try {
    console.log("[AI] Attempting Gemini 1.5 Flash...");
    raw = await callGemini(BRAINDUMP_PROMPT, text);
    console.log("[AI] Gemini responded successfully");
  } catch (geminiError) {
    console.error("[AI] Gemini failed:", geminiError);
    try {
      console.log("[AI] Falling back to Claude...");
      raw = await callClaude(BRAINDUMP_PROMPT, text);
      console.log("[AI] Claude responded successfully");
    } catch (claudeError) {
      console.error("[AI] Claude also failed:", claudeError);
      throw new Error("Both AI providers failed");
    }
  }

  const cleaned = cleanAIResponse(raw!);
  let parsed: any;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[AI] JSON parse failed. Raw:", raw!);
    throw new Error("Failed to parse AI response as JSON");
  }

  return validateBrainDumpResponse(parsed);
}

export async function extractYouTubeSteps(
  transcript: string,
  sourceUrl: string,
): Promise<YouTubeResponse> {
  const userInput = `Source URL: ${sourceUrl}\n\nTranscript:\n${transcript}`;
  let raw: string;

  try {
    console.log("[AI] Attempting Gemini for YouTube...");
    raw = await callGemini(YOUTUBE_PROMPT, userInput);
    console.log("[AI] Gemini responded successfully");
  } catch (geminiError) {
    console.error("[AI] Gemini failed:", geminiError);
    try {
      raw = await callClaude(YOUTUBE_PROMPT, userInput);
    } catch {
      throw new Error("Both AI providers failed");
    }
  }

  const cleaned = cleanAIResponse(raw!);
  let parsed: any;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse YouTube AI response");
  }

  return validateYouTubeResponse(parsed, sourceUrl);
}
