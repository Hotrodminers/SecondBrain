// src/lib/ai.ts
// AI Provider — Groq primary, Claude backup, Gemini backup

const BRAINDUMP_PROMPT = `You are a productivity assistant that classifies tasks into an Eisenhower Matrix.

INPUT: The user will paste unstructured text — a messy brain dump of tasks, goals, worries, deadlines, and random thoughts.

YOUR JOB:
1. Extract each distinct task or actionable item from the text
2. Classify each into exactly one quadrant:
   - "do_now": Urgent AND Important. Deadlines within 1-2 days, critical obligations, things with consequences if missed.
   - "schedule": Important but NOT Urgent. Long-term goals, skill building, career prep, health habits.
   - "delegate": Urgent but NOT Important. Minor deadlines, busywork someone else could handle.
   - "drop": Neither Urgent nor Important. Time-wasters, distractions.
3. Assign an optional category tag when obvious (academics, career, health, personal, extracurricular)
4. Add a brief note only when it adds useful context

OUTPUT FORMAT: Respond with ONLY a valid JSON object. No markdown backticks. No explanation. No preamble. Just the raw JSON.

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
- Maximum 10 nodes per dump
- Labels must be 2-6 words, action-oriented
- IDs must be "bd_1", "bd_2", "bd_3" etc.
- Every node MUST have id, label, and quadrant. note and category can be null.
- quadrant MUST be exactly one of: "do_now", "schedule", "delegate", "drop"
- If input is empty or nonsensical, return {"nodes": []}
- Do NOT invent tasks the user didn't mention
- Do NOT return anything except the JSON object`;

const YOUTUBE_PROMPT = `You are a productivity assistant that extracts actionable steps from video transcripts.

INPUT: A transcript from a YouTube video.

YOUR JOB:
1. Read through the transcript carefully
2. Extract concrete, actionable steps or key learning milestones
3. Order them logically (the sequence they should be done in)
4. Write each step as a short verb-phrase

OUTPUT FORMAT: Respond with ONLY a valid JSON object. No markdown backticks. No explanation. Just the raw JSON.

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
- Maximum 12 steps
- Labels must be verb phrases: "Install Node.js", not "Node.js installation"
- IDs must be "yt_1", "yt_2" etc.
- If transcript is empty or not useful, return {"title": "Unknown", "source_url": "", "steps": []}
- Do NOT return anything except the JSON object`;

const RELATIONSHIP_PROMPT = `You analyze a list of tasks and identify relationships between them.

INPUT: A JSON list of tasks, each with an "id" and "label" (and sometimes a note).

YOUR JOB: Find meaningful relationships between PAIRS of tasks:
- "depends_on": the source task should be done AFTER the target — the target is a prerequisite for the source. Example: "Submit application" depends_on "Get approval".
- "related_to": the two tasks belong to the same topic / project / theme, but neither must strictly come before the other.

OUTPUT FORMAT: Respond with ONLY a valid JSON object. No markdown backticks. No explanation. Just the raw JSON.

{
  "edges": [
    { "source": "bd_2", "target": "bd_1", "type": "depends_on" },
    { "source": "bd_3", "target": "bd_4", "type": "related_to" }
  ]
}

RULES:
- Only use task IDs that appear in the input. Never invent IDs.
- source and target MUST be different IDs.
- Only add a relationship when it is clearly implied — it is perfectly fine to return few or no edges: {"edges": []}.
- Each pair of tasks should appear at most once.
- Do NOT return anything except the JSON object.`;

// ─── Response Cleaning ──────────────────────────────────────────

function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

const VALID_QUADRANTS = ['do_now', 'schedule', 'delegate', 'drop'];

function validateBrainDumpResponse(data: any) {
  if (!data || !data.nodes || !Array.isArray(data.nodes)) {
    return { nodes: [] };
  }

  const validated = data.nodes
    .filter((n: any) => {
      return (
        n &&
        typeof n.label === 'string' &&
        n.label.trim().length > 0 &&
        typeof n.quadrant === 'string' &&
        VALID_QUADRANTS.includes(n.quadrant)
      );
    })
    .slice(0, 10)
    .map((n: any, index: number) => ({
      id: typeof n.id === 'string' ? n.id : `bd_${index + 1}`,
      label: String(n.label).trim().slice(0, 60),
      quadrant: n.quadrant,
      note: n.note && typeof n.note === 'string' ? n.note.slice(0, 120) : null,
      category: n.category && typeof n.category === 'string' ? n.category.slice(0, 30) : null,
    }));

  return { nodes: validated };
}

function validateYouTubeResponse(data: any, originalUrl: string) {
  if (!data || !data.steps || !Array.isArray(data.steps)) {
    return { title: 'Unknown', source_url: originalUrl, steps: [] };
  }

  const validated = data.steps
    .filter((s: any) => s && typeof s.label === 'string' && s.label.trim().length > 0)
    .slice(0, 12)
    .map((s: any, index: number) => ({
      id: typeof s.id === 'string' ? s.id : `yt_${index + 1}`,
      label: String(s.label).trim().slice(0, 80),
      order: typeof s.order === 'number' ? s.order : index + 1,
      detail: s.detail && typeof s.detail === 'string' ? s.detail.slice(0, 150) : null,
    }));

  return {
    title: typeof data.title === 'string' ? data.title.slice(0, 100) : 'Unknown',
    source_url: originalUrl,
    steps: validated,
  };
}

const VALID_EDGE_TYPES = ['depends_on', 'related_to'];

function validateRelationships(data: any, nodes: { id: string }[]) {
  if (!data || !Array.isArray(data.edges)) return { edges: [] };

  const ids = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const edges: { source: string; target: string; type: string }[] = [];

  for (const e of data.edges) {
    if (!e || typeof e.source !== 'string' || typeof e.target !== 'string') continue;
    if (e.source === e.target) continue;
    // Drop hallucinated edges that reference non-existent nodes.
    if (!ids.has(e.source) || !ids.has(e.target)) continue;

    const type = VALID_EDGE_TYPES.includes(e.type) ? e.type : 'related_to';
    // Dedupe: depends_on is directional, related_to is symmetric.
    const key =
      type === 'depends_on'
        ? `d:${e.source}->${e.target}`
        : `r:${[e.source, e.target].sort().join('|')}`;
    if (seen.has(key)) continue;
    seen.add(key);

    edges.push({ source: e.source, target: e.target, type });
  }

  return { edges: edges.slice(0, 30) };
}

// ─── Groq API (Primary) ────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(systemPrompt: string, userText: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

// ─── Claude API (Backup 1) ─────────────────────────────────────

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt: string, userText: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userText }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');
  return text;
}

// ─── Gemini API (Backup 2) ─────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(systemPrompt: string, userText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const combinedPrompt = `${systemPrompt}\n\n---\n\nUser input:\n${userText}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ─── AI Call with Triple Fallback ───────────────────────────────

async function callAI(systemPrompt: string, userText: string): Promise<string> {
  // Try Groq first (fastest, free)
  try {
    console.log('[AI] Attempting Groq...');
    const result = await callGroq(systemPrompt, userText);
    console.log('[AI] Groq responded');
    return result;
  } catch (err) {
    console.error('[AI] Groq failed:', err);
  }

  // Try Claude second
  try {
    console.log('[AI] Falling back to Claude...');
    const result = await callClaude(systemPrompt, userText);
    console.log('[AI] Claude responded');
    return result;
  } catch (err) {
    console.error('[AI] Claude failed:', err);
  }

  // Try Gemini last
  try {
    console.log('[AI] Falling back to Gemini...');
    const result = await callGemini(systemPrompt, userText);
    console.log('[AI] Gemini responded');
    return result;
  } catch (err) {
    console.error('[AI] Gemini also failed:', err);
  }

  throw new Error('All AI providers failed');
}

// ─── Exported Functions ─────────────────────────────────────────

export async function classifyBrainDump(text: string) {
  const raw = await callAI(BRAINDUMP_PROMPT, text);
  const cleaned = cleanAIResponse(raw);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[AI] JSON parse failed. Raw:', raw);
    throw new Error('Failed to parse AI response');
  }

  return validateBrainDumpResponse(parsed);
}

// Dedicated to Gemini per design. Relationships are a secondary enrichment,
// so any failure returns no edges rather than breaking the brain dump.
export async function extractRelationships(
  nodes: { id: string; label: string; note?: string | null }[],
) {
  if (!nodes || nodes.length < 2) return { edges: [] };

  const taskList = nodes.map((n) => ({
    id: n.id,
    label: n.label,
    ...(n.note ? { note: n.note } : {}),
  }));
  const userInput = `Tasks:\n${JSON.stringify(taskList, null, 2)}`;

  // Prefer Gemini (keeps Groq free for YT/brain-dump), but fall back to
  // Groq then Claude so a Gemini outage/quota issue never blocks relationships.
  let raw: string | null = null;
  const providers: [string, (s: string, u: string) => Promise<string>][] = [
    ['Gemini', callGemini],
    ['Groq', callGroq],
    ['Claude', callClaude],
  ];
  for (const [name, fn] of providers) {
    try {
      console.log(`[AI] Extracting relationships via ${name}...`);
      raw = await fn(RELATIONSHIP_PROMPT, userInput);
      console.log(`[AI] Relationships from ${name}`);
      break;
    } catch (err) {
      console.error(`[AI] Relationship via ${name} failed:`, err);
    }
  }
  if (raw === null) {
    console.error('[AI] All providers failed for relationships');
    return { edges: [] };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanAIResponse(raw));
  } catch {
    console.error('[AI] Relationship JSON parse failed. Raw:', raw);
    return { edges: [] };
  }

  return validateRelationships(parsed, nodes);
}

export async function extractYouTubeSteps(transcript: string, sourceUrl: string) {
  const userInput = `Source URL: ${sourceUrl}\n\nTranscript:\n${transcript}`;
  const raw = await callAI(YOUTUBE_PROMPT, userInput);
  const cleaned = cleanAIResponse(raw);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[AI] YouTube JSON parse failed. Raw:', raw);
    throw new Error('Failed to parse YouTube AI response');
  }

  return validateYouTubeResponse(parsed, sourceUrl);
}