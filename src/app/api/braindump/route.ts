import { NextRequest, NextResponse } from 'next/server';
import { classifyBrainDump } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ nodes: [] }, { status: 200 });
    }

    // Groq classifies the dump into quadrants. Relationships are computed
    // separately over the whole board via /api/relationships.
    const result = await classifyBrainDump(text.trim());

    // Give every node a globally-unique id so repeated dumps never collide.
    const batchId = Date.now().toString(36);
    const nodes = result.nodes.map((n: any, i: number) => ({
      ...n,
      id: `bd_${batchId}_${i}`,
    }));

    return NextResponse.json({ nodes }, { status: 200 });
  } catch (error) {
    console.error('[braindump route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', nodes: [] },
      { status: 500 },
    );
  }
}
