import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { extractYouTubeSteps } from "@/lib/ai";

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

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
    } catch {
      return NextResponse.json(
        { error: "Could not fetch transcript. Video may not have captions." },
        { status: 400 },
      );
    }

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "Transcript too short to extract steps." },
        { status: 400 },
      );
    }

    const truncated = transcript.split(" ").slice(0, 800).join(" ");

    console.log(`[YouTube] Sending ${truncated.length} chars to AI...`);
    const result = await extractYouTubeSteps(truncated, url);
    console.log(`[YouTube] Returned ${result.steps.length} steps`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[YouTube] Error:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 },
    );
  }
}
