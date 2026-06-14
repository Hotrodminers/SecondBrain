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