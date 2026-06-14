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

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

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

export async function classifyBrainDump(text: string) {
  let raw: string;

  try {
    console.log('[AI] Attempting Gemini...');
    raw = await callGemini(BRAINDUMP_PROMPT, text);
    console.log('[AI] Gemini responded');
  } catch (geminiError) {
    console.error('[AI] Gemini failed:', geminiError);
    try {
      console.log('[AI] Falling back to Claude...');
      raw = await callClaude(BRAINDUMP_PROMPT, text);
      console.log('[AI] Claude responded');
    } catch (claudeError) {
      console.error('[AI] Claude also failed:', claudeError);
      throw new Error('Both AI providers failed');
    }
  }

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
