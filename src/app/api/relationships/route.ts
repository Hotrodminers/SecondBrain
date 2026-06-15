import { NextRequest, NextResponse } from 'next/server';
import { extractRelationships } from '@/lib/ai';
import { buildRelationshipEdges } from '@/lib/quadrants';

// Finds relationships across the WHOLE board: the client sends every current
// task node, so new dumps link to tasks that are already on the canvas.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nodes = Array.isArray(body?.nodes) ? body.nodes : [];

    const tasks = nodes
      .filter((n: any) => n && typeof n.id === 'string' && typeof n.label === 'string')
      .map((n: any) => ({ id: n.id, label: n.label, note: n.note ?? null }));

    if (tasks.length < 2) {
      return NextResponse.json({ edges: [] }, { status: 200 });
    }

    const rel = await extractRelationships(tasks);
    const edges = buildRelationshipEdges(rel.edges);

    return NextResponse.json({ edges }, { status: 200 });
  } catch (error) {
    console.error('[relationships route] Error:', error);
    return NextResponse.json({ edges: [] }, { status: 500 });
  }
}
