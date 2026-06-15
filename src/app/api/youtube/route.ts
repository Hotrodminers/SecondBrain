import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { extractYouTubeSteps } from "@/lib/ai";

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

// Fetch a transcript. YouTube blocks direct transcript requests from datacenter
// IPs (e.g. Vercel), so when SUPADATA_API_KEY is set we use Supadata, which
// proxies the request and works server-side. Locally (no key) we fall back to
// the youtube-transcript library, which works from residential IPs.
async function fetchTranscript(videoId: string, url: string): Promise<string> {
  const key = process.env.SUPADATA_API_KEY;

  if (key) {
    try {
      const res = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(
          url,
        )}&text=true`,
        { headers: { "x-api-key": key } },
      );
      if (res.ok) {
        const data = await res.json();
        const text =
          typeof data.content === "string"
            ? data.content
            : Array.isArray(data.content)
              ? data.content.map((c: any) => c.text).join(" ")
              : "";
        if (text.trim().length > 0) return text;
        console.log("[YouTube] Supadata returned empty content");
      } else {
        console.log(
          "[YouTube] Supadata error",
          res.status,
          await res.text().catch(() => ""),
        );
      }
    } catch (e: any) {
      console.log("[YouTube] Supadata fetch failed:", e?.message);
    }
  }

  // Fallback (works from residential IPs / local dev)
  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  return segments.map((s: any) => s.text).join(" ");
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
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    console.log(`[YouTube] Fetching transcript for ${videoId}...`);
    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId, url.trim());
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

    const truncated = transcript.split(" ").slice(0, 800).join(" ");

    console.log(`[YouTube] Sending ${truncated.length} chars to AI...`);
    const result = await extractYouTubeSteps(truncated, url);
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
