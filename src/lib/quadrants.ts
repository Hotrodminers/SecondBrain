// src/lib/quadrants.ts
// Maps quadrant names to canvas positions for React Flow nodes

interface Position {
  x: number;
  y: number;
}

const QUADRANT_ZONES = {
  do_now:   { xMin: 50,  xMax: 350, yMin: 50,  yMax: 350 },
  schedule: { xMin: 450, xMax: 750, yMin: 50,  yMax: 350 },
  delegate: { xMin: 50,  xMax: 350, yMin: 450, yMax: 750 },
  drop:     { xMin: 450, xMax: 750, yMin: 450, yMax: 750 },
};

// Places a node in its quadrant, stacking vertically to avoid overlap
export function getNodePosition(
  quadrant: string,
  indexInQuadrant: number
): Position {
  const zone = QUADRANT_ZONES[quadrant as keyof typeof QUADRANT_ZONES];
  if (!zone) {
    return { x: 400, y: 400 }; // fallback to center
  }

  return {
    x: zone.xMin + 40 + Math.random() * 150,
    y: zone.yMin + 40 + indexInQuadrant * 90,
  };
}

// Places YouTube steps as a vertical chain
export function getYouTubeStepPosition(
  order: number,
  startX: number = 900,
  startY: number = 50
): Position {
  return {
    x: startX,
    y: startY + (order - 1) * 100,
  };
}

// ─── Brain-dump relationships → disjoint sets (Union-Find) ──────

export interface Relationship {
  source: string;
  target: string;
  type: string; // "depends_on" | "related_to"
}

// Distinct colors for each cluster of connected tasks.
const SET_PALETTE = [
  "#a78bfa", "#f472b6", "#22d3ee", "#34d399",
  "#fbbf24", "#fb923c", "#60a5fa", "#f87171",
];

// Groups tasks into disjoint sets (Union-Find). Two things merge tasks:
//   1. a shared category (deterministic, from the classifier) — the base grouping
//   2. explicit edges (LLM dependencies + manual links)
// Tasks that end up alone get no color.
export function computeGroups(
  nodes: { id: string; category?: string | null }[],
  edges: Relationship[],
) {
  const parent: Record<string, string> = {};
  nodes.forEach((n) => (parent[n.id] = n.id));

  function find(x: string): string {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression
      x = parent[x];
    }
    return x;
  }
  function union(a: string, b: string) {
    if (parent[a] === undefined || parent[b] === undefined) return;
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // 1. merge tasks that share a category
  const byCategory: Record<string, string[]> = {};
  nodes.forEach((n) => {
    const cat = (n.category || "").trim().toLowerCase();
    if (cat) (byCategory[cat] ||= []).push(n.id);
  });
  Object.values(byCategory).forEach((ids) => {
    for (let i = 1; i < ids.length; i++) union(ids[0], ids[i]);
  });

  // 2. merge tasks linked by an edge (dependency or manual)
  edges.forEach((e) => union(e.source, e.target));

  const groups: Record<string, string[]> = {};
  nodes.forEach((n) => {
    const root = find(n.id);
    (groups[root] ||= []).push(n.id);
  });

  const setColorOf: Record<string, string> = {};
  const setIdOf: Record<string, number> = {};
  let idx = 0;
  Object.values(groups).forEach((members) => {
    if (members.length > 1) {
      const color = SET_PALETTE[idx % SET_PALETTE.length];
      members.forEach((m) => {
        setColorOf[m] = color;
        setIdOf[m] = idx;
      });
      idx++;
    }
  });

  return { setColorOf, setIdOf, setCount: idx };
}

// Builds React Flow edges from validated relationships, colored by type.
// (Node color carries the disjoint set, so edges stay stable when groups merge.)
export function buildRelationshipEdges(edges: Relationship[]) {
  return edges.map((e, i) => {
    const isDep = e.type === "depends_on";
    const color = isDep ? "#f59e0b" : "#14b8a6";
    return {
      id: `rel-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      animated: isDep,
      data: { relType: e.type },
      ...(isDep
        ? { markerEnd: { type: "arrowclosed", color, width: 16, height: 16 } }
        : {}),
      style: {
        stroke: color,
        strokeWidth: 2,
        strokeDasharray: isDep ? undefined : "6 4",
        opacity: 0.85,
      },
    };
  });
}

// Creates edges linking YouTube steps in sequence
export function createYouTubeEdges(steps: { id: string; order: number }[]) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const edges = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    edges.push({
      id: `edge-${sorted[i].id}-${sorted[i + 1].id}`,
      source: sorted[i].id,
      target: sorted[i + 1].id,
      animated: true,
      style: { stroke: "#14b8a6", strokeWidth: 2 },
    });
  }

  return edges;
}