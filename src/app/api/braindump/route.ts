import { NextRequest, NextResponse } from 'next/server';
import { classifyBrainDump } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ nodes: [] }, { status: 200 });
    }

    const result = await classifyBrainDump(text.trim());
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[braindump route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', nodes: [] },
      { status: 500 }
    );
  }
}
