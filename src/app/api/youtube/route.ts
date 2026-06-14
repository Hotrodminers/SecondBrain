import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Extract video ID
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // 2. Fetch transcript
    console.log(`[YouTube] Fetching transcript for ${videoId}...`);
    let transcript: string;
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s: any) => s.text).join(' ');
    } catch {
      return NextResponse.json(
        { error: 'Could not fetch transcript. Video may not have captions.' },
        { status: 400 }
      );
    }

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript too short to extract steps.' },
        { status: 400 }
      );
    }

    // 3. Truncate to ~3000 words to avoid token limits
    const truncated = transcript.split(' ').slice(0, 3000).join(' ');

    // 4. Send to Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const combinedPrompt = `${YOUTUBE_PROMPT}\n\n---\n\nSource URL: ${url}\n\nTranscript:\n${truncated}`;

    console.log(`[YouTube] Sending ${truncated.length} chars to Gemini...`);
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
      console.error('[YouTube] Gemini error:', errorText);
      return NextResponse.json({ error: 'AI processing failed' }, { status: 503 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    // 5. Parse and validate
    const cleaned = cleanAIResponse(rawText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[YouTube] JSON parse failed. Raw:', rawText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const result = validateYouTubeResponse(parsed, url);
    console.log(`[YouTube] Returned ${result.steps.length} steps`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[YouTube] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}