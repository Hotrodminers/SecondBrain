import { NextRequest, NextResponse } from 'next/server';
import { classifyBrainDump } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ nodes: [] });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 2000) {
      return NextResponse.json(
        { error: 'Input too long. Keep under 2000 characters.' },
        { status: 400 }
      );
    }

    console.log(`[BrainDump] Processing ${trimmedText.length} chars...`);
    const result = await classifyBrainDump(trimmedText);
    console.log(`[BrainDump] Returned ${result.nodes.length} nodes`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[BrainDump] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Both AI providers failed')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process brain dump.' },
      { status: 500 }
    );
  }
}
