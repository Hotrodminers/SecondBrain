import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
<<<<<<< HEAD
import Groq from "groq-sdk";

const YOUTUBE_PROMPT = `You are a productivity assistant that extracts actionable steps from video transcripts.

INPUT: A transcript from a YouTube video.

YOUR JOB:
1. Read through the transcript carefully
2. Extract concrete, actionable steps or key learning milestones
3. Order them logically (the sequence they should be done in)
4. Write each step as a short verb-phrase

OUTPUT FORMAT: You MUST return ONLY a valid JSON object. Do not include markdown formatting.

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
- If transcript is empty or not useful, return {"title": "Unknown", "source_url": "", "steps": []}`;
=======
import { extractYouTubeSteps } from "@/lib/ai";
>>>>>>> 714ae523f01c47c97e61619aaa10d9732727618d

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

<<<<<<< HEAD
function cleanAIResponse(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  return cleaned.trim();
}

function validateYouTubeResponse(data: any, originalUrl: string) {
  if (!data || !data.steps || !Array.isArray(data.steps)) {
    return { title: "Unknown", source_url: originalUrl, steps: [] };
  }

  // Generate a unique ID prefix for this batch to prevent React duplicate key errors
  const batchId = Math.random().toString(36).substring(2, 9);

  const validated = data.steps
    .filter(
      (s: any) => s && typeof s.label === "string" && s.label.trim().length > 0,
    )
    .slice(0, 12)
    .map((s: any, index: number) => ({
      // Unique ID format ensures React never sees duplicate keys when adding multiple videos
      id: `yt_${batchId}_${index + 1}`,
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

=======
>>>>>>> 714ae523f01c47c97e61619aaa10d9732727618d
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 },
      );
    }

    console.log(`[YouTube] Fetching transcript for ${videoId}...`);
    let transcript: string;
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s: any) => s.text).join(" ");
    } catch (txErr: any) {
      console.log("[YouTube] Transcript FAILED:", txErr?.message);
      return NextResponse.json(
        {
          error:
            txErr?.message?.replace("[YoutubeTranscript] 🚨 ", "") ||
            "Could not fetch transcript. Video may not have captions.",
        },
        { status: 400 },
      );
    }

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "Transcript too short to extract steps." },
        { status: 400 },
      );
    }

<<<<<<< HEAD
    // 3. Truncate to ~1500 words
    const truncated = transcript.split(" ").slice(0, 1500).join(" ");
    const combinedPrompt = `${YOUTUBE_PROMPT}\n\n---\n\nSource URL: ${url}\n\nTranscript:\n${truncated}`;

    console.log(`[YouTube] Sending ${truncated.length} chars to Groq...`);

    // 4. Securely Initialize Groq INSIDE the function
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[YouTube] Missing GROQ_API_KEY.");
      return NextResponse.json(
        { error: "Groq API key is missing." },
        { status: 503 },
      );
    }

    const groq = new Groq({ apiKey: apiKey });

    // 5. Send to Groq using Llama 3.3
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: combinedPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawText = chatCompletion.choices[0]?.message?.content;
    if (!rawText) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    // 6. Parse and validate
    const cleaned = cleanAIResponse(rawText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[YouTube] JSON parse failed.");
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    const result = validateYouTubeResponse(parsed, url);
=======
    const truncated = transcript.split(" ").slice(0, 800).join(" ");

    console.log(`[YouTube] Sending ${truncated.length} chars to AI...`);
    const result = await extractYouTubeSteps(truncated, url);
>>>>>>> 714ae523f01c47c97e61619aaa10d9732727618d
    console.log(`[YouTube] Returned ${result.steps.length} steps`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log("[YouTube] Error:", error?.message);
    return NextResponse.json(
      { error: `Failed to process video: ${error?.message || "unknown"}` },
      { status: 500 },
    );
  }
}
