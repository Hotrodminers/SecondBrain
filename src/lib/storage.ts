// src/lib/storage.ts
// Saves and loads canvas state from localStorage

const STORAGE_KEY = 'second-brain-canvas';

export function saveCanvasState(nodes: any[], edges: any[]) {
  try {
    const state = {
      nodes,
      edges,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[Storage] Failed to save:', error);
  }
}

export function loadCanvasState(): { nodes: any[]; edges: any[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) return null;
    return {
      nodes: parsed.nodes,
      edges: parsed.edges || [],
    };
  } catch {
    return null;
  }
}

export function clearCanvasState() {
  localStorage.removeItem(STORAGE_KEY);
}